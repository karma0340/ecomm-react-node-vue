// backend/services/userService.js
const { User, Order } = require('../models');
const bcrypt = require('bcryptjs');

class UserService {
  async getAllUsers() {
    try {
      return await User.findAll({
        attributes: ['id', 'username', 'email', 'name', 'role', 'avatar', 'phone', 'createdAt']
      });
    } catch (err) {
      throw new Error('Failed to fetch users: ' + err.message);
    }
  }

  async getUserById(id) {
    try {
      const user = await User.findByPk(id, {
        attributes: ['id', 'username', 'email', 'name', 'role', 'avatar', 'phone', 'createdAt']
      });
      if (!user) throw new Error('User not found');
      return user;
    } catch (err) {
      throw new Error('Failed to fetch user: ' + err.message);
    }
  }

  async createUser(data) {
    try {
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }
      if (!data.role) data.role = 'user';
      return await User.create(data);
    } catch (err) {
      throw new Error('Failed to create user: ' + err.message);
    }
  }

  async updateUser(id, updates) {
    try {
      const user = await User.findByPk(id);
      if (!user) throw new Error('User not found');

      // Username/email - enforce unique
      if (
        updates.username &&
        updates.username !== user.username
      ) {
        const exists = await User.findOne({ where: { username: updates.username } });
        if (exists) throw new Error('Username already taken');
        user.username = updates.username;
      }
      if (
        updates.email &&
        updates.email !== user.email
      ) {
        const exists = await User.findOne({ where: { email: updates.email } });
        if (exists) throw new Error('Email already taken');
        user.email = updates.email;
      }

      // Normal, always-allowed fields (allows empty string to clear field if needed)
      if (updates.name !== undefined) user.name = updates.name;
      if (updates.phone !== undefined) user.phone = updates.phone;
      if (updates.role !== undefined) user.role = updates.role;

      // Handle avatar (from req.body or from upload/multer via req.file or avatarUrl)
      // Accept both "avatar" (new field) and "avatarUrl" (legacy or alternative frontend)
      if (updates.avatar !== undefined) user.avatar = updates.avatar;
      if (updates.avatarUrl !== undefined) user.avatar = updates.avatarUrl;

      await user.save();

      // Return all fields for consistent frontend update (profile page, etc)
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        phone: user.phone || "",
        avatar: user.avatar || "",
        role: user.role,
        createdAt: user.createdAt
      };
    } catch (err) {
      throw new Error('Failed to update user: ' + err.message);
    }
  }

  async updatePassword(id, oldPassword, newPassword) {
    try {
      const user = await User.findByPk(id);
      if (!user) throw new Error('User not found');

      const isValid = await bcrypt.compare(oldPassword, user.password);
      if (!isValid) throw new Error('Old password is incorrect');

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      return true;
    } catch (err) {
      throw new Error('Failed to update password: ' + err.message);
    }
  }

  async deleteUser(id) {
    try {
      const user = await User.findByPk(id);
      if (!user) throw new Error('User not found');
      await user.destroy();
      return true;
    } catch (err) {
      throw new Error('Failed to delete user: ' + err.message);
    }
  }

  async getUserOrders(id) {
    try {
      const user = await User.findByPk(id, {
        include: [{ model: Order, as: 'orders' }]
      });
      if (!user) throw new Error('User not found');
      return user.orders;
    } catch (err) {
      throw new Error('Failed to fetch user orders: ' + err.message);
    }
  }

  async getMe(id) {
    try {
      const user = await User.findByPk(id, {
        attributes: ['id', 'username', 'email', 'name', 'role', 'avatar', 'phone', 'createdAt']
      });
      if (!user) throw new Error('User not found');
      return user;
    } catch (err) {
      throw new Error('Failed to fetch user: ' + err.message);
    }
  }
}

module.exports = new UserService();
