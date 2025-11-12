const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

class User {
  static async create({ name, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 12);
    return await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword
      }
    });
  }

  static async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
  }

  static async findById(id) {
    return await prisma.user.findUnique({
      where: { id }
    });
  }

  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
}

module.exports = User;