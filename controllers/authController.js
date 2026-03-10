const User = require('../models/User');

// @desc   Register a new user
// @route  POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'customer'
        });

        const token = user.generateToken();

        res.status(201).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                ecoScore: user.ecoScore,
                profilePhoto: user.profilePhoto,
                sustainabilityStats: user.sustainabilityStats
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Login user
// @route  POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: 'Your account has been blocked. Contact support.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = user.generateToken();

        res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                ecoScore: user.ecoScore,
                profilePhoto: user.profilePhoto,
                phone: user.phone,
                address: user.address,
                sustainabilityStats: user.sustainabilityStats
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Get current user profile
// @route  GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Update user profile
// @route  PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, address, profilePhoto } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, phone, address, profilePhoto },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Change password
// @route  PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        const token = user.generateToken();
        res.status(200).json({ success: true, token, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
