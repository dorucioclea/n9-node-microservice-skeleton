import { MongoClient } from '@neo9/n9-mongo-client';
import * as crypto from 'crypto';
import { Service } from 'typedi';
import { UserDetails, UserEntity, UserListItem, UserRequestCreate } from './users.models';

@Service()
export class UsersService {
	private static async hashPassword(password: string): Promise<string> {
		const hasher = crypto.createHash('sha256');
		await hasher.update(password);
		return hasher.digest('hex');
	}

	private mongoClient: MongoClient<UserEntity, UserListItem>;

	constructor() {
		this.mongoClient = new MongoClient('users', UserEntity, UserListItem, {
			keepHistoric: true,
		});
	}

	public async getById(userId: string): Promise<UserDetails> {
		return await this.mongoClient.findOneById(userId);
	}

	public async getByEmail(email: string): Promise<UserDetails> {
		return await this.mongoClient.findOneByKey(email, 'email');
	}

	public async existsByEmail(email: string): Promise<boolean> {
		return await this.mongoClient.existsByKey(email, 'email');
	}

	public async create(user: UserRequestCreate, creatorUserId: string): Promise<UserDetails> {
		// Hash password
		user.password = await UsersService.hashPassword(user.password);
		// Save to database
		return await this.mongoClient.insertOne(user, creatorUserId);
	}
}
