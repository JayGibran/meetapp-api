import * as yup from 'yup';
import { isBefore, startOfHour, parseISO } from 'date-fns';

import Meetup from '../models/Meetup';

class MeetupController {
  async create(req, res) {
    const meetupSchema = yup.object().shape({
      title: yup.string().required(),
      description: yup.string().required(),
      location: yup.string().required(),
      date: yup.date().required(),
      banner_id: yup.number().required(),
    });
    try {
      await meetupSchema.validate(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json(err.errors);
    }

    const hourStart = startOfHour(parseISO(req.body.date));
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not allowed' });
    }
    const meetup = await Meetup.create(req.body);
    return res.json(meetup);
  }

  async update(req, res) {
    const meetupSchema = yup.object().shape({
      id: yup.number().required(),
      title: yup.string().required(),
      description: yup.string().required(),
      location: yup.string().required(),
      date: yup.date().required(),
      user_id: yup.number().required(),
      banner_id: yup.number().required(),
    });
    try {
      await meetupSchema.validate(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json(err.errors);
    }

    const meetup = await Meetup.findByPk(req.body.id);
    if (req.userId !== meetup.user_id) {
      return res.json({
        error: "You don't have permission to modify this meetup ",
      });
    }
    const { title, description, location, date } = await meetup.update(
      req.body
    );
    return res.json({ title, description, location, date });
  }

  async delete(req, res) {
    const { id } = req.params;
    const meetup = await Meetup.findByPk(id);
    if (!meetup) {
      return res.status(400).json({
        error: 'This meetup does not exist',
      });
    }

    if (req.userId !== meetup.user_id) {
      return res.json({
        error: "You don't have permission to delete this meetup",
      });
    }

    if (isBefore(meetup.date, new Date())) {
      return res
        .status(400)
        .json({ error: "You can't delete a meetup which already happened" });
    }

    await meetup.destroy();
    return res.json({ message: 'Meetup was deleted' });
  }
}

export default new MeetupController();
