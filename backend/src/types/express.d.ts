import type { UserRole } from "@prisma/client";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name: string | null;
      role: UserRole;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
