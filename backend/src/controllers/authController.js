const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const username = req.body.username?.trim();
    const email = req.body.email?.trim();
    const password = req.body.password;

    if(!username || !email || !password) {
        return res.status(400).json({message: "All field are required"});
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
        return res.status(400).json({message: "Please provide a valid email address"});
    }

    if(password.length < 8){
        return res.status(400).json({message: "Password must be at least 8 character"});
    }

    if(username.length < 3){
        return res.status(400).json({message: "Username must be at least 3 characters"});
    }

    try{
        const [existingUser] = await pool.query(
            'SELECT user_id FROM users WHERE email = ?', [email]
        );

        if(existingUser.length > 0){
            return res.status(400).json({message: "Email is already registered"});
        }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES (?,?,?)',
        [username, email, hashedPassword]
    );

    return res.status(201).json({message: "User registered successfully!"});

    }catch(err){
        console.error("Registration Error: ", err.message);
        return res.status(500).json({message: "Internal server error"});
    }
};

const login = async (req, res) => {
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({message: "Email and password required"});
    }

    try{
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ? AND deleted_at is NULL',
            [email]
        );

        if(users.length === 0){
            return res.status(401).json({message: "Invalid email or password"});
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if(!isMatch){
            return res.status(401).json({message: "Invalid email or password"});
        }

        const token = jwt.sign(
            {id: user.user_id},
            process.env.JWT_SECRET,
            {expiresIn: '30m'}
        );

        return res.status(200).json({
            message: "Login successfully",
            token,
            user:{
                id: user.user_id,
                username: user.username,
                email: user.email
            }
        });
        
    } catch(err) {
        console.error("Login Error: ", err.message);
        return res.status(500).json({message: "Internal server error"});
    }
};

module.exports = {
    register,
    login
};