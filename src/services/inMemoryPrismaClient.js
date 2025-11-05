const { randomUUID } = require('crypto');

const withTimestamps = (record, existing) => {
  const now = new Date();
  if (!existing) {
    return {
      ...record,
      createdAt: record.createdAt ? new Date(record.createdAt) : now,
      updatedAt: record.updatedAt ? new Date(record.updatedAt) : now,
    };
  }

  return {
    ...existing,
    ...record,
    createdAt: existing.createdAt,
    updatedAt: now,
  };
};

class InMemoryModel {
  constructor() {
    this.items = new Map();
  }

  create({ data }) {
    const id = data.id || randomUUID();
    const record = withTimestamps({ ...data, id }, null);
    this.items.set(id, record);
    return { ...record };
  }

  update({ where, data }) {
    const target = this.items.get(where.id);
    if (!target) {
      const error = new Error('Record not found');
      error.code = 'P2025';
      throw error;
    }
    const updated = withTimestamps({ ...target, ...data, id: where.id }, target);
    this.items.set(where.id, updated);
    return { ...updated };
  }

  findUnique({ where }) {
    const record = this.items.get(where.id);
    return record ? { ...record } : null;
  }

  delete({ where }) {
    const record = this.items.get(where.id);
    if (!record) {
      const error = new Error('Record not found');
      error.code = 'P2025';
      throw error;
    }
    this.items.delete(where.id);
    return { ...record };
  }

  createMany({ data }) {
    data.forEach((entry) => {
      const id = entry.id || randomUUID();
      const record = withTimestamps({ ...entry, id }, null);
      this.items.set(id, record);
    });
    return { count: data.length };
  }

  deleteMany(options = {}) {
    const { where = {} } = options;
    let count = 0;
    Array.from(this.items.values()).forEach((item) => {
      let matches = true;
      if (where.videoProcessingId) {
        matches = matches && item.videoProcessingId === where.videoProcessingId;
      }
      if (matches) {
        this.items.delete(item.id);
        count += 1;
      }
    });
    return { count };
  }

  findMany(options = {}) {
    const { where = {}, orderBy, take } = options;
    let results = Array.from(this.items.values()).map((item) => ({ ...item }));

    if (where.videoProcessingId) {
      results = results.filter(
        (item) => item.videoProcessingId === where.videoProcessingId
      );
    }

    if (where.confidenceScore && where.confidenceScore.gte !== undefined) {
      const threshold = where.confidenceScore.gte;
      results = results.filter((item) => item.confidenceScore >= threshold);
    }

    if (orderBy?.createdAt === 'asc') {
      results.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (orderBy?.createdAt === 'desc') {
      results.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    if (typeof take === 'number') {
      results = results.slice(0, take);
    }

    return results;
  }
}

class InMemoryPrismaClient {
  constructor() {
    this.videoProcessing = new InMemoryModel();
    this.ocrResult = new InMemoryModel();
  }

  async $disconnect() {
    // no-op for in-memory client
  }
}

module.exports = { InMemoryPrismaClient };
