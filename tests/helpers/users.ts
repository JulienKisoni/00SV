import { USER_ROLES } from '../../src/types/models';
import DummyUsers from '../../mocks/users.json';
import { IUserMethods, UserModel } from '../../src/models/user';
import { encrypt } from '../../src/utils/hash';

type CreateUserDoc = Omit<IUserMethods, '_id' | 'createdAt' | 'updatedAt'>;

export const injectUsers = async () => {
  const users = await createUsers();
  return users;
};

export const createUsers = async () => {
  const promises = DummyUsers.map((user) => {
    const { username, password, email, role } = user;
    const doc: CreateUserDoc = {
      username,
      password,
      email,
      profile: {
        role: role as USER_ROLES,
      },
    };
    return createUser(doc);
  });
  const users = await Promise.all(promises);
  return users;
};

export const createUser = async (doc: CreateUserDoc) => {
  const { password } = doc;
  const { encryptedText } = await encrypt({ plainText: password });
  doc.password === encryptedText;
  const user = await UserModel.create(doc);
  return user;
};
