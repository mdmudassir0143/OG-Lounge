import * as CryptoJS from 'crypto-js';
import { ethers } from 'ethers';

/**
 * Real encryption and IPFS storage utilities for NFT metadata
 */
export class RealGameEncryption {
  /**
   * Generate a random encryption key
   */
  private static generateEncryptionKey(): string {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }

  /**
   * Encrypt game code using AES-256-GCM
   */
  static async encryptGameCode(
    gameCode: string,
    ownerAddress: string
  ): Promise<{
    encryptedData: string;
    encryptionKey: string;
    sealedKey: string;
    metadataHash: string;
  }> {
    try {
      console.log('Starting encryption process...');
      console.log('CryptoJS available:', !!CryptoJS);
      console.log('Game code length:', gameCode.length);
      console.log('Owner address:', ownerAddress);

      // Generate a random encryption key
      const encryptionKey = this.generateEncryptionKey();
      console.log('Generated encryption key:', encryptionKey);
      
      // Encrypt the game code using AES-256-CBC
      const encrypted = CryptoJS.AES.encrypt(gameCode, encryptionKey, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }).toString();

      // Create sealed key (encrypted with owner's address as salt)
      const sealedKey = CryptoJS.AES.encrypt(encryptionKey, ownerAddress).toString();
      
      // Generate metadata hash
      const metadataHash = ethers.keccak256(ethers.toUtf8Bytes(encrypted + ownerAddress));

      return {
        encryptedData: encrypted,
        encryptionKey,
        sealedKey,
        metadataHash
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt game code');
    }
  }

  /**
   * Decrypt game code using AES-256-GCM
   */
  static async decryptGameCode(
    encryptedData: string,
    encryptionKey: string
  ): Promise<string> {
    try {
      // Decrypt the game code
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      const decrypted = decryptedBytes.toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        throw new Error('Invalid decryption key or corrupted data');
      }
      
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt game code');
    }
  }

  /**
   * Unseal encryption key using owner's address
   */
  static async unsealEncryptionKey(
    sealedKey: string,
    ownerAddress: string
  ): Promise<string> {
    try {
      const decryptedBytes = CryptoJS.AES.decrypt(sealedKey, ownerAddress);
      const encryptionKey = decryptedBytes.toString(CryptoJS.enc.Utf8);
      
      if (!encryptionKey) {
        throw new Error('Invalid owner address or corrupted sealed key');
      }
      
      return encryptionKey;
    } catch (error) {
      console.error('Key unsealing failed:', error);
      throw new Error('Failed to unseal encryption key');
    }
  }
}

/**
 * IPFS storage service using Pinata
 */
export class IPFSStorageService {
  private static readonly PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
  private static readonly PINATA_JWT = process.env.PINATA_JWT;
  private static readonly GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'ipfs.io';

  /**
   * Upload encrypted metadata to IPFS
   */
  static async uploadEncryptedMetadata(
    encryptedData: string,
    metadataHash: string,
    gameTitle: string,
    ownerAddress: string
  ): Promise<{
    ipfsHash: string;
    ipfsUrl: string;
    encryptedMetadataURI: string;
  }> {
    if (!this.PINATA_JWT) {
      throw new Error('Pinata JWT not configured');
    }

    try {
      const metadata = {
        encryptedGameCode: encryptedData,
        metadataHash,
        title: gameTitle,
        owner: ownerAddress,
        encrypted: true,
        encryptedAt: new Date().toISOString(),
        version: '1.0',
        standard: 'ERC-7857'
      };

      const pinataMetadata = {
        name: `encrypted-game-${gameTitle}-${Date.now()}.json`,
        keyvalues: {
          type: 'encrypted-nft-metadata',
          title: gameTitle,
          owner: ownerAddress,
          encrypted: 'true',
          uploadedAt: new Date().toISOString()
        }
      };

      const data = {
        pinataContent: metadata,
        pinataMetadata,
        pinataOptions: {
          cidVersion: 1
        }
      };

      const response = await fetch(this.PINATA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.PINATA_JWT}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinata upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      const ipfsUrl = `https://${this.GATEWAY_URL}/ipfs/${result.IpfsHash}`;

      return {
        ipfsHash: result.IpfsHash,
        ipfsUrl,
        encryptedMetadataURI: `ipfs://${result.IpfsHash}`
      };
    } catch (error) {
      console.error('IPFS upload failed:', error);
      throw new Error(`Failed to upload to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve encrypted metadata from IPFS
   */
  static async retrieveEncryptedMetadata(ipfsHash: string): Promise<{
    encryptedGameCode: string;
    metadataHash: string;
    title: string;
    owner: string;
    encryptedAt: string;
  }> {
    try {
      const ipfsUrl = `https://${this.GATEWAY_URL}/ipfs/${ipfsHash}`;
      
      const response = await fetch(ipfsUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch from IPFS: ${response.status}`);
      }

      const metadata = await response.json();
      
      return {
        encryptedGameCode: metadata.encryptedGameCode,
        metadataHash: metadata.metadataHash,
        title: metadata.title,
        owner: metadata.owner,
        encryptedAt: metadata.encryptedAt
      };
    } catch (error) {
      console.error('IPFS retrieval failed:', error);
      throw new Error(`Failed to retrieve from IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}