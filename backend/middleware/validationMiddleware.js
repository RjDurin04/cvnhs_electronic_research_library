const { body, validationResult } = require('express-validator');

const validate = (validations) => {
    return async (req, res, next) => {
        for (let validation of validations) {
            await validation.run(req);
        }

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(400).json({ errors: errors.array() });
    };
};

const loginValidation = [
    body('username').notEmpty().withMessage('Username is required').trim().escape(),
    body('password').notEmpty().withMessage('Password is required')
];

const userValidation = [
    body('username').notEmpty().withMessage('Username is required').trim().escape(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('full_name').notEmpty().withMessage('Full Name is required').trim().escape()
];

const strandValidation = [
    body('short').notEmpty().withMessage('Acronym is required').trim().escape().toUpperCase(),
    body('name').notEmpty().withMessage('Strand Name is required').trim().escape()
];

module.exports = { validate, loginValidation, userValidation, strandValidation };
