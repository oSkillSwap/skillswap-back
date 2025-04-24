import { User } from '../models/user.model.js';
import argon2 from 'argon2';

export const userController = {
    register: async (req, res) => {
        try{
            const { 
                username, 
                lastName, 
                firstName, 
                email, 
                password, 
                role = 'member', // Default role
                avatar = '/avatar/avatar1.png', // Default avatar
                description 
            }  = req.validatedData;

            // Hash with argon2
            const hashedPassword = await argon2.hash(password);

            const newUser = await User.create({ 
                username, 
                lastName, 
                firstName, 
                email, 
                password : hashedPassword, 
                role,
                avatar,
                description 
            });
            res.status(201).json({ message: "Utilisateur créé", user: newUser });
        } 
        catch(error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Servor Error' });
        }
    },

    login: async (req, res) => {
        try{
            const { email, password } = req.validatedData;

            // Check if the user exists
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(401).json({ message: 'Identifiants incorrects' });
            }

            // Check if the password is correct
            const isPasswordValid = await argon2.verify(user.password, password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Mot de passe incorrect incorrects' });
            }

            res.status(200).json({ message: 'Connexion réussie', user });
        }
        catch(error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}