import { Availability } from './availability.js';
import { Category } from './category.js';
import { Message } from './message.js';
import { Post } from './post.js';
import { Proposition } from './proposition.js';
import { Review } from './review.js';
import { Skill } from './skill.js';
import { Follow } from './follow.js';
import { User } from './user.js';



// User 0,N <-> 0,N Message 
User.hasMany( Message, { as: 'SentMessages', foreignKey: 'sender_id' });
User.hasMany( Message, { as: 'ReceivedMessages', foreignKey: 'receiver_id' });
Message.belongsTo( User, { as: 'Sender', foreignKey: 'sender_id' });
Message.belongsTo( User, { as: 'Receiver', foreignKey: 'receiver_id' });


// User 0,N <-> 0,N Follow
User.hasMany( Follow, { as: 'Following', foreignKey: 'follower_id' });
User.hasMany( Follow, { as: 'Followers', foreignKey: 'followed_id' });
Follow.belongsTo( User, { as: 'Follower', foreignKey: 'follower_id' });
Follow.belongsTo( User, { as: 'Followed', foreignKey: 'followed_id' });


// User 0,N <-> 1,1 Post
User.hasMany( Post, { foreignKey: 'user_id' });
Post.belongsTo( User, { foreignKey: 'user_id', allowNull: false });


// User 0,N <-> 1,1 Proposition
User.hasMany( Proposition, { as: 'SentPropositions', foreignKey: 'sender_id' });
User.hasMany( Proposition, { as: 'ReceivedPropositions', foreignKey: 'receiver_id' });
Proposition.belongsTo( User, { as: 'Sender', foreignKey: 'sender_id', allowNull: false });
Proposition.belongsTo( User, { as: 'Receiver', foreignKey: 'receiver_id', allowNull: false });

// User 0,N <-> 1,1 Review
User.hasMany( Review, { foreignKey: 'user_id' });
Review.belongsTo( User, { foreignKey: 'user_id', allowNull: false });

// Review 1,1 <-> 0,1 Proposition
Proposition.belongsTo( Review, { foreignKey: 'proposition_id', allowNull: true });
Review.belongsTo( Proposition, { foreignKey: 'proposition_id', allowNull: false });

// Proposition 0,1 <-> 0,N Post
Post.hasMany( Proposition, { foreignKey: 'post_id' });
Proposition.belongsTo( Post, { foreignKey: 'post_id', allowNull: true });

// Skill 1,1 <-> 0,N Category
Category.hasMany( Skill, { foreignKey: 'category_id' });
Skill.belongsTo( Category, { foreignKey: 'category_id', allowNull: false });



// User 0,N <-> 0,N Skill (has)
User.belongsToMany( Skill, {
    through: 'UserHasSkill',
    as: 'Skills',
    foreignKey: 'user_id',
    otherKey: 'skill_id'
});
Skill.belongsToMany( User, {
    through: 'UserHasSkill',
    as: 'UsersWithSkill',
    foreignKey: 'skill_id',
    otherKey: 'user_id'
});



// User 0,N <-> 0,N Skill (wants)
User.belongsToMany( Skill, {
    through: 'UserWantsSkill',
    as: 'WantedSkills',
    foreignKey: 'user_id',
    otherKey: 'skill_id'
});
Skill.belongsToMany( User, {
    through: 'UserWantsSkill',
    as: 'UsersWantingSkill',
    foreignKey: 'skill_id',
    otherKey: 'user_id'
});



// User 0,N <-> 0,N Availability
User.belongsToMany( Availability, {
    through: 'UserHasAvailability',
    as: 'Availabilities',
    foreignKey: 'user_id',
    otherKey: 'availability_id'
});
Availability.belongsToMany( User, {
    through: 'UserHasAvailability',
    as: 'Users',
    foreignKey: 'availability_id',
    otherKey: 'user_id'
});


export { User, Message, Post, Proposition, Review, Skill, Follow, Availability, Category};
