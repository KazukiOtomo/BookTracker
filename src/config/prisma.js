const { logger } = require('../utils/logger');

let prismaClient;

const getPrismaClient = () => {
  if (prismaClient) {
    return prismaClient;
  }

  try {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const { PrismaClient } = require('@prisma/client');
    prismaClient = new PrismaClient();
    logger.info('Prisma client initialized');
  } catch (error) {
    logger.warn('Falling back to in-memory datastore for Prisma client', {
      error: error.message,
    });
    // eslint-disable-next-line global-require
    const { InMemoryPrismaClient } = require('../services/inMemoryPrismaClient');
    prismaClient = new InMemoryPrismaClient();
    prismaClient.$isInMemory = true;
  }

  return prismaClient;
};

const prisma = getPrismaClient();

module.exports = { prisma };
