import * as Yup from 'yup';
import { startOfHour, isBefore } from 'date-fns';

import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';

class SubscriptionController {
  async create(req, res) {
    const subscriptionSchema = Yup.object().shape({
      user_id: Yup.number().required(),
      meetup_id: Yup.number().required(),
    });
    try {
      await subscriptionSchema.validate(req.body, { abortEarly: false });
    } catch (err) {
      return res.json({ error: err.errors });
    }

    const meetup = await Meetup.findByPk(req.body.meetup_id);

    if (!meetup) {
      return res.status(400).json({ error: 'This meetup does not exist' });
    }

    if (meetup.user_id === req.body.user_id) {
      return res.status(400).json({
        error: 'The meetup creator cannot subscribe in the same meetup',
      });
    }

    const hourStart = startOfHour(meetup.date);
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({
        error: 'You cannot subscribe to a meetup which the date already passed',
      });
    }

    const subscriptionAlreadyExist = await Subscription.findOne({
      where: { user_id: req.body.user_id, meetup_id: req.body.meetup_id },
    });

    if (subscriptionAlreadyExist) {
      return res.status(400).json({
        error: 'The same user cannot subscribe in the same meetup twice',
      });
    }

    const otherSubscriptionsSameHour = await Subscription.findAll({
      where: { user_id: req.body.user_id },
      include: [{ model: Meetup, as: 'meetup', where: { date: meetup.date } }],
    });

    if (otherSubscriptionsSameHour.length > 0) {
      return res.status(400).json({
        error: 'User cannot subscribe more than one meetup at the same hour',
      });
    }

    const savedSubscription = await Subscription.create(req.body);
    return res.json(savedSubscription);
  }
}

export default new SubscriptionController();
