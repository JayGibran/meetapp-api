import { Model } from 'sequelize';

class Subscription extends Model {
  static init(sequelize) {
    super.init({}, { sequelize });
  }

  static associate(model) {
    this.belongsTo(model.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(model.Meetup, { foreignKey: 'meetup_id', as: 'meetup' });
  }
}

export default Subscription;
