import { Availability } from './availability.js';
import { Category } from './category.js';
import { Message } from './message.js';
import { Post } from './post.js';
import { Proposition } from './proposition.js';
import { Review } from './review.js';
import { Skill } from './skill.js';
import { Follow } from './follow.js';
import { User } from './user.js';



// User <-> Message
// BelongsTo pour récupérer l'expéditeur du message 
// hasMany pour récupérer tous les messages d'un utilisateur 
User.hasMany( Message, { as: 'SentMessages', foreignKey: 'sender_id' });
User.hasMany( Message, { as: 'ReceivedMessages', foreignKey: 'receiver_id' });
Message.belongsTo( User, { as: 'Sender', foreignKey: 'sender_id' });
Message.belongsTo( User, { as: 'Receiver', foreignKey: 'receiver_id' });


// User <-> Follow
// Qui je suis, qui me suis, qui suit, qui est suivi 
User.hasMany( Follow, { as: 'Following', foreignKey: 'follwer_id' });
User.hasMany( Follow, { as: 'Followers', foreignKey: 'followed_id' });
Follow.belongsTo( User, { as: 'Follower', foreignKey: 'follwer_id' });
Follow.belongsTo( User, { as: 'Followed', foreignKey: 'followed_id' });


// User <-> Post
// Un utilisateur peut faire plusieurs posts, un post appartient à un seul utilisateur
User.hasMany( Post, { foreignKey: 'user_id' });
Post.belongsTo( User, { foreignKey: 'user_id' });


// User <-> Proposition
// Un utilisateur peut envoyer plusieurs propositions, un utilisateur peut recevoir plusieurs propositions
// Une proposition est envoyée/appartient par un utilisateur, une proposition est reçue par un utilisateur
User.hasMany( Proposition, { as: 'SentPropositions', foreignKey: 'sender_id' });
User.hasMany( Proposition, { as: 'ReceivedPropositions', foreignKey: 'receiver_id' });
Proposition.belongsTo( User, { as: 'Sender', foreignKey: 'sender_id', allowNull: false });
Proposition.belongsTo( User, { as: 'Receiver', foreignKey: 'receiver_id', allowNull: false });

// User <-> Review
// Un utilisateur peut faire plusieurs reviews, une review est écrite par un seul utilisateur
User.hasMany( Review, { foreignKey: 'user_id' });
Review.belongsTo( User, { foreignKey: 'user_id' });

// Review <-> Proposition
// Une proposition peut avoir plusieurs reviews, une review appartient à une seule proposition
Proposition.belongsTo( Review, { foreignKey: 'proposition_id', allowNull: true });
Review.belongsTo( Proposition, { foreignKey: 'proposition_id', allowNull: false });

// Proposition <-> Post
// Un post peut avoir plusieurs propositions, une proposition appartient à un seul post
Post.hasMany( Proposition, { foreignKey: 'post_id' });
Proposition.belongsTo( Post, { foreignKey: 'post_id', allowNull: true });

// Skill <-> Category
// Une catégorie peut contenir plusieurs compétences, une compétence appartient forcément à une seule catégorie
Category.hasMany( Skill, { foreignKey: 'category_id' });
Skill.belongsTo( Category, { foreignKey: 'category_id', allowNull: false });



// User <-> Skill (has)
// compétences qu’un utilisateur possède, utilisateurs qui possèdent une compétence particulière
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



// User <-> Skill (wants)
// compétences que veut apprendre un utilisateur, utilisateurs qui veulent apprendre une compétence donnée
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



// User <-> Availability
// Les disponibilités d'un utilisateur, tous les utilisateurs diponibles à un créneau
User.belongsToMany( Availability, {
    through: 'UserHasAvailability',
    as: 'Availabilities',
    foreignKey: 'user_id',
    otherKey: 'availibility_id'
});
Availability.belongsToMany( User, {
    through: 'UserHasAvailability',
    as: 'Users',
    foreignKey: 'availability_id',
    otherKey: 'user_id'
});


export { User, Message, Post, Proposition, Review, Skill, Follow, Availability, Category};
