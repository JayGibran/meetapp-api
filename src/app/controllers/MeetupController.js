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
      user_id: yup.number().required(),
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
}

export default new MeetupController();
