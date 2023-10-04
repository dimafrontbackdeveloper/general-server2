import mongoose from 'mongoose'

const SheetSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	accounts: [
		{
			isActive: Boolean,
			botUuid: String,
			user: Number,
		},
	],
	isHasActiveBotForLocalServer: {
		type: Boolean,
		default: false,
		required: true,
	},
	baseUrl: {
		type: String,
	},
})

export default mongoose.model('Sheet', SheetSchema)
