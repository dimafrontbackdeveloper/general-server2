import express from 'express'
// import { uk21 } from './settings.js'
import { uk21 } from './settings.js'

const findIndexOfActiveAccount = accounts => {
	let indexOfActiveAccount = accounts.findIndex(
		account => account.isActive === 'true'
	)
	return indexOfActiveAccount
}

const checkIsNeedToReplaceIndexOfActiveAccountToZero = (
	indexOfActiveAccount,
	accounts
) => {
	if (
		indexOfActiveAccount === -1 ||
		indexOfActiveAccount > accounts.length - 1
	) {
		return 0
	} else {
		return indexOfActiveAccount
	}
}

const getAccounts = async sheetBaseUrl => {
	const accountsResponce = await fetch(`${sheetBaseUrl}?action=getSheetRows`)
	const accounts = await accountsResponce.json()

	return accounts
}

const app = express()
app.use(express.json())

async function startNextBot(token, sheetBaseUrl, bk, logMessage = '') {
	try {
		const BASE_URL = sheetBaseUrl

		// get accounts
		const res = await fetch(`${BASE_URL}?action=getSheetRows`)
		let { accounts } = await res.json()
		console.log(accounts)
		console.log('start')

		let indexOfActiveAccount = findIndexOfActiveAccount(accounts) // index of account with field 'isActive' true in sheet
		const activeAccount = accounts[indexOfActiveAccount] // active account
		console.log('activeAccount')
		console.log(activeAccount)

		if (activeAccount) {
			activeAccount['warnings/Errors'] = ''
		}

		let valueBets = null

		let oldIndexOfActiveAccount = indexOfActiveAccount
		let isNeedToStartNextBot = true

		do {
			indexOfActiveAccount += 1
			indexOfActiveAccount = checkIsNeedToReplaceIndexOfActiveAccountToZero(
				indexOfActiveAccount,
				accounts
			)
			if (oldIndexOfActiveAccount === indexOfActiveAccount) {
				isNeedToStartNextBot = false
			}
		} while (
			eval(accounts[indexOfActiveAccount].isNeedToCheck) ||
			(eval(accounts[indexOfActiveAccount].isBalanceLessFlat) &&
				oldIndexOfActiveAccount !== indexOfActiveAccount)
		)

		console.log('before pause')
		await fetch(
			`https://alg-fox.net/api/v1/bot-client/connected/${activeAccount.botUuid}/`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					authorization: `bearer ${token}`,
				},
				body: JSON.stringify({
					msg_type: 'PAUSE_BOT',
					params: {},
				}),
			}
		)
		console.log('after pause')

		if (logMessage) {
			// get bets of current bot
			const handledForksResponce = await fetch(
				`https://alg-fox.net/api/v1/bot-client/connected/${activeAccount.botUuid}/`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						authorization: `bearer ${token}`,
					},
					body: JSON.stringify({
						msg_type: 'READ_HANDLED_FORK_RECORDS',
						params: {
							limit: 5,
							statuses: ['SUCCESS', 'VALUE_BET'],
						},
					}),
				}
			)

			const handledForksData = await handledForksResponce.json()
			valueBets = handledForksData.handledForkList

			if (logMessage === 'restrict') {
				const oldAndNewAccountRes = await fetch(
					`${BASE_URL}?action=replaceAccount`
				)

				const oldAndNewAccountData = await oldAndNewAccountRes.json()
				const body = {
					msg_type: 'LOAD_SETTINGS',
					params: {
						settings: {
							botSettingsBet: {},
							botSettingsBk: {},
							botSettingsCommon: {},
						},
					},
				}
				body.params.settings.botSettingsBk[bk] = {
					authLogin: `${oldAndNewAccountData.data.newAccount[0]}`,
					authPassword: `${oldAndNewAccountData.data.newAccount[1]}`,
				}
				const loadSettingsRes = await fetch(
					`https://alg-fox.net/api/v1/bot-client/connected/${oldAndNewAccountData.data.oldAccount.botUuid}/`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							authorization: `bearer ${token}`,
						},
						body: JSON.stringify(body),
					}
				)

				const loadSettingsData = await loadSettingsRes.json()

				accounts = accounts.map(account => {
					if (account.botUuid !== activeAccount.botUuid) {
						return account
					} else {
						activeAccount['login'] = oldAndNewAccountData.data.newAccount[0]
						activeAccount['password'] = oldAndNewAccountData.data.newAccount[1]
						activeAccount['isHasLimit'] = 'false'
						return activeAccount
					}
				})
			}

			if (logMessage === 'balanceLessThenZero') {
				accounts = accounts.map(account => {
					if (account.botUuid !== activeAccount.botUuid) {
						return account
					} else {
						activeAccount['isBalanceLessFlat'] = 'true'
						return activeAccount
					}
				})
			}

			if (logMessage === 'limit') {
				// await fetch(`${BASE_URL}?action=limit`)

				const body = {
					msg_type: 'LOAD_SETTINGS',
					params: {
						settings: {
							botSettingsBet: {},
							botSettingsBk: {
								bet365: {
									betAmount: [20, 20],
								},
							},
							botSettingsCommon: {},
						},
					},
				}

				body.params.settings.botSettingsBk[bk] = {
					betAmount: [20, 20],
				}

				const loadSettingsRes = await fetch(
					`https://alg-fox.net/api/v1/bot-client/connected/${activeAccount.botUuid}/`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							authorization: `bearer ${token}`,
						},
						body: JSON.stringify(body),
					}
				)

				const loadSettingsData = await loadSettingsRes.json()

				activeAccount.isHasLimit = 'true'
				accounts = accounts.map(account => {
					if (account.botUuid !== activeAccount.botUuid) {
						return account
					} else {
						return activeAccount
					}
				})
			}

			if (logMessage === 'success bet') {
				console.log('success bet')
			}

			if (logMessage === 'skip') {
				console.log('skip')
			}
		}

		console.log('valueBets')
		console.log(valueBets)

		const newOrOldActiveAccount = accounts[indexOfActiveAccount]
		console.log('newOrOldActiveAccount')
		console.log(newOrOldActiveAccount)

		if (valueBets) {
			valueBets = valueBets.reverse()
			for (let handledFork of valueBets) {
				delete handledFork.id
				delete handledFork.createdAt
				delete handledFork.updatedAt
				const res = await fetch(
					`https://alg-fox.net/api/v1/bot-client/connected/${newOrOldActiveAccount.botUuid}/`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							authorization: `bearer ${token}`,
						},
						body: JSON.stringify({
							msg_type: 'CREATE_HANDLED_FORK_RECORD',
							params: handledFork,
						}),
					}
				)
				const data = await res.json()
				console.log('data передача ставок')
				console.log(data)
			}
		}

		if (isNeedToStartNextBot) {
			// start bot
			await fetch(
				`https://alg-fox.net/api/v1/bot-client/connected/${newOrOldActiveAccount.botUuid}/`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						authorization: `bearer ${token}`,
					},
					body: JSON.stringify({
						msg_type: 'START_BOT',
						params: {},
					}),
				}
			)
		}

		// push new accounts to the sheet
		const newAccounts = accounts.map((account, i) => {
			if (i !== indexOfActiveAccount) {
				account['isActive'] = 'false'
				return account
			} else if (i === indexOfActiveAccount) {
				account['isActive'] = 'true'

				return account
			}
		})

		await fetch(`${BASE_URL}?action=updateSheetRows`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ newAccounts }),
		})
		console.log('finish')

		return 'success'
	} catch (error) {
		return `error: ${error}`
	}
}

app.post('/startNextBot', async (req, res) => {
	const token = req.body.token
	const sheetBaseUrl = req.body.sheetBaseUrl
	const bk = req.body.bk
	const logMessage = req.body.logMessage

	startNextBot(token, sheetBaseUrl, bk, logMessage).then(data => {
		res.json({
			data,
		})
	})
})

app.get('/activeAccount', async (req, res) => {
	const sheetBaseUrl = req.query.sheetBaseUrl
	const sheetRes = await fetch(`${sheetBaseUrl}?action=getActiveAccount`)
	const activeAccount = await sheetRes.json()

	if (JSON.stringify(activeAccount) !== '{}') {
		// if active account exists
		res.json({
			data: activeAccount,
		})
	} else {
		res.json({
			data: false,
		})
	}
})

app.get('/accounts', async (req, res) => {
	const accounts = await getAccounts(req.query.sheetBaseUrl)

	res.json({
		data: accounts,
	})
})

app.get('/balances', async (req, res) => {
	const sheetBaseUrl = req.query.sheetBaseUrl
	const { accounts } = await getAccounts(sheetBaseUrl)
	console.log(accounts)
	const bk = req.query.bk
	const token = req.query.token
	console.log(`bk: ${bk}`)

	async function getBalanceOfOneAccount(account) {
		const balanceRes = await fetch(
			`https://alg-fox.net/api/v1/bot-client/connected/${account.botUuid}/`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					authorization: `bearer ${token}`,
				},
				body: JSON.stringify({
					msg_type: 'BK_FACADE_EXEC',
					params: {
						bkName: bk,
						method: 'getUserBalance',
						args: [],
					},
				}),
			}
		)
		const balance = await balanceRes.json()

		return balance
	}

	async function getBalanceOfEveryoneAccount(accounts) {
		const balances = []

		for (const account of accounts) {
			const balance = await getBalanceOfOneAccount(account)

			if (balance.detail) {
				balances.push(`something wrong: ${balance.detail}`)
			} else {
				balances.push(balance.result)
			}
		}

		return balances
	}

	const balances = await getBalanceOfEveryoneAccount(accounts)
	res.json(balances)
})

app.put('/accounts', async (req, res) => {
	await fetch(`${req.body.sheetBaseUrl}?action=updateSheetRows`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			newAccounts: req.body.accounts,
		}),
	})
})

app.post('/settings', async (req, res) => {
	const token = req.body.token
	const bk = req.body.bk
	const accounts = req.body.accounts

	accounts.forEach(async account => {
		let body = null
		if (account.setting === 'uk21') {
			body = uk21
		}

		body.params.settings.botSettingsBk[bk]['authLogin'] = account.login
		body.params.settings.botSettingsBk[bk]['authPassword'] = account.password
		body.params.settings.botSettingsBk[bk]['betAmount'] = [
			Number(account.initialFlat),
			Number(account.initialFlat),
		]

		const loadSettingsRes = await fetch(
			`https://alg-fox.net/api/v1/bot-client/connected/${account.botUuid}/`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					authorization: `bearer ${token}`,
				},
				body: JSON.stringify(body),
			}
		)

		const loadSettingsData = await loadSettingsRes.json()

		return loadSettingsData
	})

	res.json({
		data: 'success',
	})
})

app.listen(5000, async err => {
	if (err) {
		return console.log(err)
	}
	console.log('Server OK')
})
