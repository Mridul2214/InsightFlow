
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// export const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'User not found' });

//     // ✅ Debug logs
//     console.log('Entered Email:', email);
//     console.log('Entered Password:', password);
//     console.log('Stored Hashed Password:', user.password);

//     const isMatch = await bcrypt.compare(password, user.password);
//     console.log('Password Match:', isMatch); // ✅ true or false

//     if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: '1d',
//     });

// res.json({
//   token,
//   user: {
//     id: user._id,
//     _id: user._id,
//     name: user.name,
//     username: user.username,
//     email: user.email,
//     bio: user.bio,
//     profilePic: user.profilePic, // ✅ Correct key
//   }
// });

//   } catch (error) {
//     console.error('Login Error:', error);
//     res.status(500).json({ message: 'Login failed', error });
//   }
// };
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    // ❌ Block login for banned users
    if (user.isBanned) {
      return res.status(403).json({ message: 'Your account has been banned by the admin.' });
    }

    // ✅ Debug logs
    console.log('Entered Email:', email);
    console.log('Entered Password:', password);
    console.log('Stored Hashed Password:', user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password Match:', isMatch);

    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePic: user.profilePic,
        isBanned: user.isBanned, // Optional: send to frontend
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Login failed', error });
  }
};
