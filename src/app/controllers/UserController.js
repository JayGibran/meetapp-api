import * as yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    const userSchema = yup.object().shape({
      name: yup.string().required(),
      email: yup
        .string()
        .email()
        .required(),
      password: yup
        .string()
        .min(6)
        .required(),
    });
    try {
      await userSchema.validate(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json(err.errors);
    }
    const userExists = await User.findOne({ where: { email: req.body.email } });
    if (userExists && userExists.id !== req.userId) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const { id, name, email, provider } = await User.create(req.body);

    return res.json({ id, name, email, provider });
  }

  async update(req, res) {
    const userSchema = yup.object().shape({
      name: yup.string().required(),
      email: yup.string().required(),
      oldPassword: yup.string().min(6),
      password: yup
        .string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: yup
        .string()
        .when('password', (password, field) =>
          password
            ? field
                .required()
                .oneOf(
                  [yup.ref('password')],
                  'Confirm Password must be the same value than Password!'
                )
            : field
        ),
    });

    try {
      await userSchema.validate(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }
    const { email, oldPassword } = req.body;
    const user = await User.findByPk(req.userId);
    if (email !== user.email) {
      const userExists = await User.findOne({
        where: { email: req.body.email },
      });
      if (userExists) {
        return res.status(400).json({ error: 'User already exists' });
      }
    }
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'OldPassword does not match' });
    }

    const { id, name, provider } = await user.update(req.body);
    return res.json({ id, name, email, provider });
  }
}

export default new UserController();
