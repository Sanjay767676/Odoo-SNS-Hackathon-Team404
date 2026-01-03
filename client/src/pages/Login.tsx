import { motion } from "framer-motion";
import { Link } from "wouter";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Enter your credentials to access your account"
    >
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <motion.div whileFocus={{ scale: 1.01 }}>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              required 
              className="bg-muted/50 focus-visible:ring-primary/30 transition-shadow"
            />
          </motion.div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password">
              <a className="text-sm font-medium text-primary hover:underline underline-offset-4">
                Forgot password?
              </a>
            </Link>
          </div>
          <motion.div whileFocus={{ scale: 1.01 }}>
            <Input 
              id="password" 
              type="password" 
              required 
              className="bg-muted/50 focus-visible:ring-primary/30 transition-shadow"
            />
          </motion.div>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button type="submit" className="w-full h-11 font-semibold shadow-lg shadow-primary/20">
            Sign In
          </Button>
        </motion.div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Don&apos;t have an account?{" "}
          <Link href="/signup">
            <a className="font-semibold text-primary hover:underline underline-offset-4">
              Create an account
            </a>
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
