import { motion } from "framer-motion";
import { Link } from "wouter";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Signup() {
  return (
    <AuthLayout 
      title="Create an account" 
      subtitle="Join GlobeTrotter to start planning your next journey"
    >
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <motion.div whileFocus={{ scale: 1.01 }}>
              <Input 
                id="firstName" 
                placeholder="Jane" 
                required 
                className="bg-muted/50 focus-visible:ring-primary/30 transition-shadow"
              />
            </motion.div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <motion.div whileFocus={{ scale: 1.01 }}>
              <Input 
                id="lastName" 
                placeholder="Doe" 
                required 
                className="bg-muted/50 focus-visible:ring-primary/30 transition-shadow"
              />
            </motion.div>
          </div>
        </div>

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
          <Label htmlFor="password">Password</Label>
          <motion.div whileFocus={{ scale: 1.01 }}>
            <Input 
              id="password" 
              type="password" 
              required 
              className="bg-muted/50 focus-visible:ring-primary/30 transition-shadow"
            />
          </motion.div>
          <p className="text-[11px] text-muted-foreground pt-1">
            Must be at least 8 characters long with a mix of letters and numbers.
          </p>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="pt-2"
        >
          <Button type="submit" className="w-full h-11 font-semibold shadow-lg shadow-primary/20">
            Create Account
          </Button>
        </motion.div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Already have an account?{" "}
          <Link href="/login">
            <a className="font-semibold text-primary hover:underline underline-offset-4">
              Sign in
            </a>
          </Link>
        </p>

        <p className="text-[11px] text-center text-muted-foreground px-8 leading-relaxed">
          By clicking continue, you agree to our{" "}
          <a className="underline underline-offset-2 hover:text-primary">Terms of Service</a>{" "}
          and{" "}
          <a className="underline underline-offset-2 hover:text-primary">Privacy Policy</a>.
        </p>
      </form>
    </AuthLayout>
  );
}
