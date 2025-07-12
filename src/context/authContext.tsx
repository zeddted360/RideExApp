"use client";
import { createContext, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentUserAsync, updateUser } from "@/state/authSlice";
import { RootState, AppDispatch } from "@/state/store";

interface AuthContextType {
  userId: string | null;
  username: string | null;
  email: string | null;
  role: "admin" | "user" | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: any | null;
  updateUser: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType>({
  userId: null,
  username: null,
  email: null,
  role: null,
  isLoading: true,
  isAuthenticated: false,
  user: null,
  updateUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(getCurrentUserAsync());
  }, [dispatch]);

  const handleUpdateUser = (userData: any) => {
    dispatch(updateUser(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        userId: user?.userId || null,
        username: user?.username || null,
        email: user?.email || null,
        role: user?.role || null,
        isLoading: loading === "pending",
        isAuthenticated: !!user,
        user,
        updateUser: handleUpdateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error(" An auth context must be within an authConetxt provider");
  return context;
};
