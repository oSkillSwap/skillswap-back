// seed.js
import {
    User,
    Category,
    Skill,
    Availability,
    Post,
    Message,
    Proposition,
    Review,
  } from "../models/associations.js";
  import { sequelize } from "../data/client.js";
  import { faker } from '@faker-js/faker';
  
  await sequelize.sync({ force: true });
  
  console.log("\u{1F4BE} Base synchronisée, début du seed...");
  
  // USERS
  const users = [];
  for (let i = 1; i <= 10; i++) {
    users.push(await User.create({
      username: `user${i}`,
      lastName: faker.name.lastName(),
      firstName: faker.name.firstName(),
      email: `user${i}@example.com`,
      password: "password",
      role: "member",
      avatar: `https://i.pravatar.cc/150?img=${i}`,
      description: faker.lorem.sentence(),
    }));
  }
  
  // CATEGORIES UNIQUES
  const categoryNames = new Set();
  while (categoryNames.size < 10) {
    categoryNames.add(faker.name.jobType());
  }
  const categories = [];
  for (const name of categoryNames) {
    categories.push(await Category.create({ name }));
  }
  
  // SKILLS
  const skills = [];
  for (let i = 0; i < 20; i++) {
    skills.push(await Skill.create({
      name: `Compétence ${i + 1}`,
      category_id: faker.number.int({ min: 1, max: 10 }),
    }));
  }
  
  // AVAILABILITIES
  const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  const creneaux = ["matin", "midi", "après-midi", "soir"];
  const availabilities = [];
  for (const j of jours) {
    for (const c of creneaux) {
      availabilities.push(await Availability.create({
        day_of_the_week: j,
        time_slot: c,
      }));
    }
  }
  
  // LIENS USERS <-> SKILLS & AVAILABILITIES
  for (const user of users) {
    const has = faker.helpers.shuffle(skills).slice(0, 3);
    const wants = faker.helpers.shuffle(skills).slice(0, 3);
    await user.addSkills(has);
    await user.addWantedSkills(wants);
    const userAvail = faker.helpers.shuffle(availabilities).slice(0, 10);
    await user.addAvailabilities(userAvail);
  }
  
  // POSTS
  const posts = [];
  for (const user of users) {
    for (let i = 0; i < 3; i++) {
      posts.push(await Post.create({
        title: faker.company.catchPhrase(),
        content: faker.lorem.paragraph(),
        user_id: user.id,
      }));
    }
  }
  
  // MESSAGES
  for (const sender of users) {
    for (let i = 0; i < 4; i++) {
      let receiver;
      do {
        receiver = faker.helpers.arrayElement(users);
      } while (receiver.id === sender.id);
  
      await Message.create({
        content: faker.lorem.sentence(),
        sender_id: sender.id,
        receiver_id: receiver.id,
      });
    }
  }
  
  // PROPOSITIONS
  const propositions = [];
  for (const sender of users) {
    for (let i = 0; i < 2; i++) {
      let receiver;
      do {
        receiver = faker.helpers.arrayElement(users);
      } while (receiver.id === sender.id);
  
      const post = faker.helpers.arrayElement(posts);
      propositions.push(await Proposition.create({
        content: faker.lorem.paragraph(),
        state: faker.helpers.arrayElement(["en attente", "acceptée", "refusée"]),
        sender_id: sender.id,
        receiver_id: receiver.id,
        post_id: post.id,
      }));
    }
  }
  
  // REVIEWS
  for (const user of users) {
    for (let i = 0; i < 2; i++) {
      const proposition = faker.helpers.arrayElement(propositions);
      await Review.create({
        grade: faker.number.int({ min: 1, max: 5 }),
        content: faker.lorem.sentence(),
        user_id: user.id,
        proposition_id: proposition.id,
      });
    }
  }
  
  console.log("\u2705 Seed terminé avec succès");
  await sequelize.close();
  