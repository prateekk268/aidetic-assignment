const { verify } = require('jsonwebtoken');
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const authenticate = async (context: any) => {
    
  try {
    const authorization = context.authorization;
  
    if (!authorization) {
      throw new Error('Token is required');
    }
    const decoded = await verify(authorization, 'JWT_SECRET');
    if(!decoded) throw new Error("Invalid Token");
    const userId = decoded.userId;
    const user = prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    return userId;
  } catch (err) {
    console.log(err);
    throw new Error(`${err}`);
  }
};

export { authenticate };
