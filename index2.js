import express from 'express'
// import { uk21 } from './settings.js'
import { uk21 } from './settings.js'

const variants = [
	'http://localhost:5000',
	'https://general-server.vercel.app',
	'https://sleepy-teal-snaps.cyclic.app',
]

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

const app = express()
app.use(express.json())

async function main(token, sheetBaseUrl, bk, logMessage = '') {
	try {
		const BASE_URL = sheetBaseUrl

		const res = await fetch(`${BASE_URL}?action=getSheetRows`)
		let { accounts } = await res.json()
		console.log(accounts)
		console.log('start')

		let indexOfActiveAccount = findIndexOfActiveAccount(accounts)
		const activeAccount = accounts[indexOfActiveAccount]
		console.log('activeAccount')
		console.log(activeAccount)

		if (activeAccount) {
			activeAccount['warnings/Errors'] = ''
		}

		let countOfFindingNewAccount = 0

		let valueBets = null

		if (logMessage) {
			activeAccount.countOfWorkTimes =
				Number(activeAccount.countOfWorkTimes) + 1
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
			if (logMessage === 'restrict') {
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
								statuses: ['VALUE_BET'],
							},
						}),
					}
				)

				const handledForksData = await handledForksResponce.json()

				valueBets = handledForksData.handledForkList
				do {
					indexOfActiveAccount += 1
					indexOfActiveAccount = checkIsNeedToReplaceIndexOfActiveAccountToZero(
						indexOfActiveAccount,
						accounts
					)
					countOfFindingNewAccount += 1
				} while (
					eval(accounts[indexOfActiveAccount].isNeedToCheck) &&
					countOfFindingNewAccount < accounts.length
				)
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
								statuses: ['VALUE_BET'],
							},
						}),
					}
				)

				const handledForksData = await handledForksResponce.json()

				valueBets = handledForksData.handledForkList
				do {
					indexOfActiveAccount += 1
					indexOfActiveAccount = checkIsNeedToReplaceIndexOfActiveAccountToZero(
						indexOfActiveAccount,
						accounts
					)
					countOfFindingNewAccount += 1
				} while (
					eval(accounts[indexOfActiveAccount].isNeedToCheck) &&
					countOfFindingNewAccount < accounts.length
				)

				accounts = accounts.map(account => {
					if (account.botUuid !== activeAccount.botUuid) {
						return account
					} else {
						activeAccount['isNeedToCheck'] = 'true'
						return activeAccount
					}
				})
			}

			if (logMessage === 'limit') {
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
								statuses: ['VALUE_BET'],
							},
						}),
					}
				)

				const handledForksData = await handledForksResponce.json()

				valueBets = handledForksData.handledForkList
				do {
					indexOfActiveAccount += 1
					indexOfActiveAccount = checkIsNeedToReplaceIndexOfActiveAccountToZero(
						indexOfActiveAccount,
						accounts
					)
					countOfFindingNewAccount += 1
				} while (
					eval(accounts[indexOfActiveAccount].isNeedToCheck) &&
					countOfFindingNewAccount < accounts.length
				)
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
				console.log('success bet eee')

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
								statuses: ['VALUE_BET'],
							},
						}),
					}
				)
				console.log('handledForksResponce')

				const handledForksData = await handledForksResponce.json()
				console.log('handledForksData')

				valueBets = handledForksData.handledForkList
				do {
					indexOfActiveAccount += 1
					indexOfActiveAccount = checkIsNeedToReplaceIndexOfActiveAccountToZero(
						indexOfActiveAccount,
						accounts
					)
					console.log('cqqqqqqqqqqqqqqqqqqqqq')
					countOfFindingNewAccount += 1
				} while (
					eval(accounts[indexOfActiveAccount].isNeedToCheck) &&
					countOfFindingNewAccount < accounts.length
				)
			}
			// 'SUCCESS',
			if (logMessage === 'skip') {
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
								statuses: ['VALUE_BET'],
							},
						}),
					}
				)

				const handledForksData = await handledForksResponce.json()

				valueBets = handledForksData.handledForkList
				do {
					indexOfActiveAccount += 1
					indexOfActiveAccount = checkIsNeedToReplaceIndexOfActiveAccountToZero(
						indexOfActiveAccount,
						accounts
					)
					countOfFindingNewAccount += 1
				} while (
					eval(accounts[indexOfActiveAccount].isNeedToCheck) &&
					countOfFindingNewAccount < accounts.length
				)
			}
		}
		console.log('countOfFindingNewAccount')
		console.log(countOfFindingNewAccount)
		if (countOfFindingNewAccount >= accounts.length) {
			return 'Или остался один акк, или все акки с isNeedToCheck: true'
		}

		console.log('valueBets')
		console.log(valueBets)

		let newOrOldIndexActiveAccount =
			checkIsNeedToReplaceIndexOfActiveAccountToZero(
				indexOfActiveAccount,
				accounts
			)
		const newOrOldActiveAccount = accounts[newOrOldIndexActiveAccount]
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
		// push new accounts to the sheet
		const newAccounts = accounts.map((account, i) => {
			if (i !== newOrOldIndexActiveAccount) {
				account['isActive'] = 'false'
				return account
			} else if (i === newOrOldIndexActiveAccount) {
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

app.get('/account', async (req, res) => {
	const token = req.query.token
	const sheetBaseUrl = req.query.sheetBaseUrl
	const bk = req.query.bk

	main(token, sheetBaseUrl, bk, req.query?.logMessage || '').then(data => {
		res.json({
			data,
		})
	})
})

app.get('/isHasActiveAccount', async (req, res) => {
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

app.post('/balances', async (req, res) => {
	const accounts = req.body.accounts
	const bk = req.body.bk
	const token = req.body.token

	const balances = []

	async function getBalance(account) {
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
	console.log('cyclic pidor')
	console.log('cyclic pidor')
	console.log('cyclic pidor')
	console.log('cyclic pidor')
	console.log('cyclic pidor')
	console.log('cyclic pidor')
	async function fetchBalances() {
		for (const account of accounts) {
			const balance = await getBalance(account)

			if (balance.detail) {
				balances.push(`something wrong: ${balance.detail}`)
			} else {
				balances.push(balance.result)
			}
		}

		return balances
	}

	await fetchBalances()
	res.json(balances)
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
