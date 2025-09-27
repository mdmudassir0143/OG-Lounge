import AuthLayout from "@/components/wallet/auth-layout";

const MainAuthLayout = ({ children }: { children: React.ReactNode }) => {
  return <AuthLayout>{children}</AuthLayout>;
};

export default MainAuthLayout;
