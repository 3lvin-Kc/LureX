
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import GlassPanel from "@/components/ui/GlassPanel";
import { Eye, EyeOff, Mail, Lock, AlertCircle, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import GlassCard from "@/components/3d/GlassCard";
import AnimatedBackground from "@/components/3d/AnimatedBackground";
import Button3D from "@/components/3d/Button3D";
import { motion } from "framer-motion";

// Import our security utilities
import { authRateLimiter } from "@/utils/rateLimiter";
import { securityLogger, SecurityEventType } from "@/utils/securityLogger";

// Define strong password requirements
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const loginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Helper function to detect suspicious input to prevent XSS
const containsSuspiciousContent = (input: string): boolean => {
  const suspicious = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /data:/i,
    /vbscript:/i,
  ];
  return suspicious.some(pattern => pattern.test(input));
};

// Auth state update rate limiting
const MAX_STATE_CHANGES = 5;
const STATE_CHANGE_WINDOW = 10000; // 10 seconds
let stateChanges: number[] = [];

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Prevent multiple auth requests
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Check if rate limit would be exceeded
  const checkRateLimit = (): boolean => {
    const now = Date.now();
    // Remove old timestamps
    stateChanges = stateChanges.filter(time => now - time < STATE_CHANGE_WINDOW);
    
    if (stateChanges.length >= MAX_STATE_CHANGES) {
      const lockout = now + 30000; // 30 second lockout
      setLockoutTime(lockout);
      return false;
    }
    
    stateChanges.push(now);
    return true;
  };

  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return Math.min(5, strength);
  };

  useEffect(() => {
    // Password strength calculation for register form
    const subscription = registerForm.watch((value, { name }) => {
      if (name === "password") {
        const strength = calculatePasswordStrength(value.password || "");
        setPasswordStrength(strength);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [registerForm]);

  const handleLogin = async (values: z.infer<typeof loginFormSchema>) => {
    // Check rate limiting first
    if (!authRateLimiter.tryRequest()) {
      const timeLeft = Math.ceil(authRateLimiter.getTimeUntilUnblocked() / 1000);
      toast({
        title: "Too Many Attempts",
        description: `Please wait ${timeLeft} seconds before trying again`,
        variant: "destructive",
      });
      
      securityLogger.warn(
        SecurityEventType.RATE_LIMIT,
        "Login rate limit exceeded",
        { email: values.email }
      );
      
      return;
    }

    setIsLoading(true);
    setIsAuthenticating(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        securityLogger.error(
          SecurityEventType.AUTHENTICATION,
          "Login failed",
          { error: error.message, email: values.email }
        );
        throw error;
      }
      
      securityLogger.info(
        SecurityEventType.AUTHENTICATION,
        "Login successful",
        { email: values.email }
      );
      
      toast({
        title: "Success",
        description: "You have successfully logged in",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsAuthenticating(false);
    }
  };

  const handleSignup = async (values: z.infer<typeof registerFormSchema>) => {
    // Check rate limiting first
    if (!authRateLimiter.tryRequest()) {
      const timeLeft = Math.ceil(authRateLimiter.getTimeUntilUnblocked() / 1000);
      toast({
        title: "Too Many Attempts",
        description: `Please wait ${timeLeft} seconds before trying again`,
        variant: "destructive",
      });
      
      securityLogger.warn(
        SecurityEventType.RATE_LIMIT,
        "Registration rate limit exceeded",
        { email: values.email }
      );
      
      return;
    }

    setIsLoading(true);
    setIsAuthenticating(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        securityLogger.error(
          SecurityEventType.AUTHENTICATION,
          "Registration failed",
          { error: error.message, email: values.email }
        );
        throw error;
      }
      
      securityLogger.info(
        SecurityEventType.AUTHENTICATION,
        "Registration successful",
        { email: values.email }
      );
      
      toast({
        title: "Success",
        description: "Registration successful. Please check your email for verification.",
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign up",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsAuthenticating(false);
    }
  };

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
    };
    
    checkAuth();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/dashboard");
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
      {/* 3D Animated Background */}
      <AnimatedBackground />
      
      {/* Glowing floating orbs */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-blue-500/20 blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-md z-10"
      >
        <GlassCard intensity="medium" className="w-full p-6 backdrop-blur-xl">
          <motion.div variants={item}>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="text-white">Login</TabsTrigger>
                <TabsTrigger value="register" className="text-white">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <motion.div 
                  variants={item}
                  className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6"
                >
                  <div className="space-y-2 mb-4 text-center">
                    <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                    <p className="text-gray-300 text-sm">
                      Sign in to your phishing simulation platform account
                    </p>
                  </div>
                  
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                  type="email"
                                  placeholder="Email"
                                  className="pl-10 bg-white/10 border-white/20 text-white"
                                  required
                                  disabled={isLoading}
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Password"
                                  className="pl-10 pr-10 bg-white/10 border-white/20 text-white"
                                  required
                                  disabled={isLoading}
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                  disabled={isLoading}
                                >
                                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      
                      <Button3D type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                            Logging in...
                          </div>
                        ) : "Login"}
                      </Button3D>
                    </form>
                  </Form>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="register">
                <motion.div 
                  variants={item}
                  className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6"
                >
                  <div className="space-y-2 mb-4 text-center">
                    <h2 className="text-2xl font-bold text-white">Create Account</h2>
                    <p className="text-gray-300 text-sm">
                      Register a new phishing simulation platform account
                    </p>
                  </div>
                  
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(handleSignup)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                  type="email"
                                  placeholder="Email"
                                  className="pl-10 bg-white/10 border-white/20 text-white"
                                  required
                                  disabled={isLoading}
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Password"
                                  className="pl-10 pr-10 bg-white/10 border-white/20 text-white"
                                  required
                                  disabled={isLoading}
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                  disabled={isLoading}
                                >
                                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      
                      {passwordStrength > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center">
                            <div className="h-2 flex-1 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${
                                  passwordStrength === 0 ? 'bg-gray-600' :
                                  passwordStrength === 1 ? 'bg-red-500' :
                                  passwordStrength === 2 ? 'bg-orange-500' :
                                  passwordStrength === 3 ? 'bg-yellow-500' :
                                  passwordStrength === 4 ? 'bg-lime-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${(passwordStrength / 5) * 100}%` }}
                              />
                            </div>
                            <span className="ml-2 text-xs text-gray-300">
                              {passwordStrength === 0 ? 'Weak' :
                               passwordStrength === 1 ? 'Poor' :
                               passwordStrength === 2 ? 'Fair' :
                               passwordStrength === 3 ? 'Good' :
                               passwordStrength === 4 ? 'Strong' :
                               'Very Strong'}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Confirm Password"
                                  className="pl-10 bg-white/10 border-white/20 text-white"
                                  required
                                  disabled={isLoading}
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      
                      <Alert className="bg-white/10 border-white/20">
                        <AlertCircle className="h-4 w-4 text-amber-300" />
                        <AlertTitle className="text-white">Password Requirements</AlertTitle>
                        <AlertDescription>
                          <ul className="text-xs list-disc pl-5 mt-1 text-gray-300">
                            <li>At least 8 characters long</li>
                            <li>At least one uppercase letter</li>
                            <li>At least one lowercase letter</li>
                            <li>At least one number</li>
                            <li>At least one special character</li>
                          </ul>
                        </AlertDescription>
                      </Alert>
                      
                      <Button3D type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                            Creating account...
                          </div>
                        ) : "Register"}
                      </Button3D>
                    </form>
                  </Form>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </GlassCard>
        
        {/* Floating "Secure Login" badge */}
        <motion.div
          className="absolute -top-5 left-1/2 -translate-x-1/2 z-20"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 10 }}
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 rounded-full text-white text-sm font-medium shadow-lg flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>Secure Login</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;
