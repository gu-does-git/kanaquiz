import { useRef } from 'preact/hooks'
import { stage, $stage1 } from '../stores/quiz'
import { kanaDictionary } from '../data/kanaDic'

export default function Stage0() {
	/**
	 * Creates an array of rows for a given kana type.
	 *
	 * @param {string} kanaType - The type of kana to create rows for.
	 * @return {Array<{key: number, groupName: string, characters: {[key: string]: string[]}}>} An array of rows, each containing a key, group name, and characters object.
	 */
	const createGroupRows = (kanaType) => {
		// Target kana dictionary
		const targetKana = kanaDictionary[kanaType]

		// Get all similar rows
		let similarRows = Object.keys(targetKana)
			.filter((k) => k.endsWith('s'))
			.reduce((obj, key) => {
				return Object.assign(obj, {
					[key]: targetKana[key]
				})
			}, {})

		// Get all similar rows
		let alternativeRows = Object.keys(targetKana)
			.filter((k) => k.endsWith('a'))
			.reduce((obj, key) => {
				return Object.assign(obj, {
					[key]: targetKana[key]
				})
			}, {})

		// Get all regular rows
		let rows = Object.entries(targetKana)
			.filter(([groupName]) => !groupName.endsWith('a') && !groupName.endsWith('s'))
			.map(
				([groupName, groupData]: [string, { characters: { [key: string]: string[] } }], idx) => ({
					key: idx,
					groupName,
					characters: groupData.characters
				})
			)

		// Create the final rows by merging similar and alternative rows if applicable
		const finalRows: (
			| {
					key: number
					groupName: string
					characters: { [key: string]: string[] }
			  }
			| {
					key: number
					groupName: string
					characters: { [key: string]: string[] }
			  }[]
		)[] = [...rows]

		// If there are any similar rows, format them and merge with rows
		if (similarRows && Object.keys(similarRows).length > 0) {
			finalRows.push(
				Object.entries(similarRows).map(
					([groupName, groupData]: [string, { characters: { [key: string]: string[] } }], idx) => ({
						key: idx,
						groupName,
						characters: groupData.characters
					})
				)
			)
		}

		// If there are any alternative rows, format them and merge with rows
		if (alternativeRows && Object.keys(alternativeRows).length > 0) {
			finalRows.push(
				Object.entries(alternativeRows).map(
					([groupName, groupData]: [string, { characters: { [key: string]: string[] } }], idx) => ({
						key: idx,
						groupName,
						characters: groupData.characters
					})
				)
			)
		}

		return finalRows
	}

	// Create all the group rows
	const groupRows = [
		{ key: 'hiragana', rows: createGroupRows('hiragana') },
		{ key: 'katakana', rows: createGroupRows('katakana') }
	]

	// Create all the group rows for HTML with states and stuff
	const HTMLRows = groupRows.map((group) => {
		return {
			key: group.key,
			rows: group.rows.map((row) => {
				if (Array.isArray(row) && row.length === 0) {
					return {} // Return an empty object if 'row' is an empty array
				}

				// Return row if is a regular row (object)
				if (!Array.isArray(row)) {
					return {
						key: row.key,
						groupName: row.groupName,
						characters: row.characters,
						kana: Object.keys(row.characters)
							.map((char) => char[0])
							.join(' · '),
						romaji: Object.keys(row.characters)
							.map((char) => row.characters[char][0])
							.join(' · ')
					}
				} else if (Array.isArray(row)) {
					// Return an array of rows if 'row' is an array (it means it is alternative or similar rows)
					var groupRows = []
					row.forEach((r) => {
						groupRows.push({
							key: r.key,
							groupName: r.groupName,
							characters: r.characters,
							kana: Object.keys(r.characters)
								.map((char) => char[0])
								.join(' · '),
							romaji: Object.keys(r.characters)
								.map((char) => r.characters[char][0])
								.join(' · ')
						})
					})
					// Remove the spaces and traces, then go lowercase
					return {
						title: row[0].groupName.endsWith('_a')
							? 'Alternative characters (ga · ba · kya..)'
							: 'Look-alike characters',
						name: row[0].groupName.endsWith('_a') ? 'alternative' : 'look_alike',
						rows: groupRows
					}
				}
				return {} // Return an empty object as fallback
			})
		}
	})

	// Create the start button state
	const startButton = useRef(null)

	/**
	 * Updates the start button based on the form data.
	 *
	 * @return {void} No return value.
	 */
	const updateStartButton = () => {
		const formData = new FormData(document.querySelector('#stage0-form'))
		const formProps = Object.keys(Object.fromEntries(formData))
		if (formProps.length > 0) {
			startButton.current.disabled = false
		} else {
			startButton.current.disabled = true
		}
	}

	return (
		<form
			id="stage0-form"
			action=""
			onSubmit={(e) => {
				e.preventDefault() //stop form from submitting

				// Store the selected options in local storage and start the quiz
				const formData = new FormData(e.target as HTMLFormElement)
				const selectedOptions = Object.keys(Object.fromEntries(formData))

				stage.set('1')
				$stage1.setKey('selectedOptions', JSON.stringify(selectedOptions))

				window.location.href = 'quiz/1'
			}}
		>
			<h1 class="mb-4 text-center text-6xl font-bold">
				Welcome to <span class="text-green-500">KanaQuiz</span>
			</h1>
			<p class="mb-8 p-6 text-center">
				Please <strong>choose</strong> the groups of characters that you'd like to be studying.
			</p>

			{/* <!-- Group of Characters --> */}
			<div class="mb-4 grid columns-1 gap-8 sm:block sm:columns-2">
				{HTMLRows.map((group, groupIdx) => (
					<div class="relative divide-y-2 divide-gray-200 overflow-hidden rounded-lg border-2 dark:divide-gray-400 dark:border-gray-400">
						{/* <!-- Panel Header --> */}
						<div class="bg-slate-200 p-3 text-center dark:bg-slate-800">
							<span
								class="font-bold"
								dangerouslySetInnerHTML={{
									__html:
										group.key == 'hiragana'
											? 'Hiragana · <span class="font-jp">ひらがな</span>'
											: 'Katakana · <span class="font-jp">カタカナ</span>'
								}}
							/>
						</div>

						{/* <!-- Panel Body --> */}
						<div class="grid grid-cols-1 gap-1 p-3">
							{/* This is the regular rows */}
							{group.rows.map(
								(row, rowIdx) =>
									!('title' in row) && (
										<div class="choose-row inline-flex items-center">
											<label class="cursor-pointer">
												<input
													type="checkbox"
													class="accent-green-500"
													name={row.groupName}
													data-type={group.key}
													onChange={() => {
														// Update the start button state if the form data has any properties
														updateStartButton()
													}}
												/>
												<span
													class="pl-2 font-jp text-base"
													dangerouslySetInnerHTML={{
														__html: row.romaji
													}}
													onMouseEnter={(e) => {
														// Change the span value to the kana version
														const element = HTMLRows[groupIdx].rows[rowIdx]
														const span = e.target as HTMLSpanElement
														if ('kana' in element) span.innerHTML = element.kana
													}}
													onMouseLeave={(e) => {
														// Change the span value back to the romaji version
														const element = HTMLRows[groupIdx].rows[rowIdx]
														const span = e.target as HTMLSpanElement
														if ('romaji' in element) span.innerHTML = element.romaji
													}}
												></span>
											</label>
										</div>
									)
							)}

							{/* This is the alternative/similar rows */}
							{group.rows.map(
								(row, rowIdx) =>
									'title' in row && (
										<div className="marker:content-none">
											<details class="group">
												<summary class="inline-flex w-full cursor-pointer select-none items-center">
													<label class="pointer-events-none">
														<input
															type="checkbox"
															class="pointer-events-auto accent-green-400"
															name={row.name.toLowerCase()}
															data-type={group.key}
															onChange={(e) => {
																// Select all the alternatives/similar rows under this group
																// Based on the checkbox state
																const shouldCheck = (e.target as HTMLInputElement).checked
																row.rows.forEach((r) => {
																	const checkbox = document.getElementsByName(
																		r.groupName
																	)[0] as HTMLInputElement
																	checkbox.checked = shouldCheck
																})

																// Update the start button state if the form data has any properties
																updateStartButton()
															}}
														/>
														<span class="font-jp text-base">
															<svg
																xmlns="http://www.w3.org/2000/svg"
																viewBox="0 0 24 24"
																class="inline-block h-6 w-6 -rotate-90 transition-transform group-[[open]]:rotate-90"
															>
																<path fill="currentColor" d="m14 17l-5-5l5-5z"></path>
															</svg>
															{row.title}
														</span>
													</label>
												</summary>
												<div class="grid grid-rows-[0fr] overflow-hidden pl-2 opacity-0 transition-all delay-100 ease-in-out group-[[open]]:grid-rows-[1fr] group-[[open]]:opacity-100">
													<div class="overflow-hidden">
														{/* <!-- Alternative / Similar Rows --> */}
														{row.rows.map((r, rIdx) => (
															<div class="choose-row ml-3 inline-flex w-full items-center">
																<label class="cursor-pointer">
																	<input
																		type="checkbox"
																		class="accent-green-500"
																		name={r.groupName}
																		data-type={group.key}
																		onChange={() => {
																			// Update the start button state if the form data has any properties
																			updateStartButton()

																			// Check if all rows from this group are checked
																			const allChecked = row.rows.map((r) => {
																				const checkbox = document.getElementsByName(
																					r.groupName
																				)[0] as HTMLInputElement
																				return checkbox.checked
																			})
																			const checkedCount = allChecked.filter(
																				(c) => c === true
																			).length

																			// If all rows from this group are checked, check the whole group
																			const checkbox = document.querySelector(
																				`input[data-type="${group.key}"][name="${row.name}"]`
																			) as HTMLInputElement
																			checkbox.indeterminate = false

																			// Set checkbox state based on the number of checked rows
																			if (checkedCount === 0) {
																				checkbox.checked = false
																				checkbox.indeterminate = false
																			} else if (checkedCount === allChecked.length) {
																				checkbox.checked = true
																				checkbox.indeterminate = false
																			} else {
																				checkbox.checked = false
																				checkbox.indeterminate = true
																			}
																		}}
																	/>
																	<span
																		class="pl-2 font-jp text-base"
																		dangerouslySetInnerHTML={{
																			__html: r.romaji
																		}}
																		onMouseEnter={(e) => {
																			// Change the span value to the kana version
																			const element = HTMLRows[groupIdx].rows[rowIdx].rows[rIdx]
																			const span = e.target as HTMLSpanElement
																			if (element && 'kana' in element)
																				span.innerHTML = element.kana
																		}}
																		onMouseLeave={(e) => {
																			// Change the span value back to the romaji version
																			const element = HTMLRows[groupIdx].rows[rowIdx].rows[rIdx]
																			const span = e.target as HTMLSpanElement
																			if (element && 'romaji' in element)
																				span.innerHTML = element.romaji
																		}}
																	></span>
																</label>
															</div>
														))}
													</div>
												</div>
											</details>
										</div>
									)
							)}
						</div>

						{/* <!-- Panel Footer --> */}
						<div class="bg-slate-200 p-3 text-center dark:bg-slate-800">
							<a
								href="javascript:;"
								class="footer-options transition-colors hover:text-green-500"
								onClick={() => {
									// Select all options from the same group
									const checkboxs = document.querySelectorAll(`input[data-type="${group.key}"]`)
									checkboxs.forEach((checkbox: HTMLInputElement) => {
										checkbox.checked = true
										checkbox.indeterminate = false
									})
									updateStartButton()
								}}
							>
								All
							</a>
							<span>&nbsp;&middot;&nbsp;</span>
							<a
								href="javascript:;"
								class="footer-options footer-options-none transition-colors hover:text-green-500"
								onClick={() => {
									// Unselect all options from the same group
									const checkboxs = document.querySelectorAll(`input[data-type="${group.key}"]`)
									checkboxs.forEach((checkbox: HTMLInputElement) => {
										checkbox.checked = false
										checkbox.indeterminate = false
									})
									updateStartButton()
								}}
							>
								None
							</a>
							<span>&nbsp;&middot;&nbsp;</span>
							<a
								href="javascript:;"
								data-option={group.key}
								class="footer-options transition-colors hover:text-green-500"
								onClick={() => {
									// Select all alternative options from the same group
									group.rows.forEach((element) => {
										if ('name' in element && element.name == 'alternative') {
											const rows = element.rows

											// Select all options from the same group
											rows.forEach((r) => {
												const checkbox = document.getElementsByName(
													r.groupName
												)[0] as HTMLInputElement
												checkbox.checked = true
											})

											// Check the group
											const checkbox = document.querySelector(
												`input[data-type="${group.key}"][name="${element.name}"]`
											) as HTMLInputElement
											checkbox.checked = true
											checkbox.indeterminate = false
										}
									})

									updateStartButton()
								}}
							>
								All alternative
							</a>
							<span>&nbsp;&middot;&nbsp;</span>
							<a
								href="javascript:;"
								data-option={group.key}
								class="footer-options transition-colors hover:text-green-500"
								onClick={() => {
									// Unselect all alternative options from the same group
									group.rows.forEach((element) => {
										if ('name' in element && element.name == 'alternative') {
											const rows = element.rows

											// Unselect all options from the same group
											rows.forEach((r) => {
												const checkbox = document.getElementsByName(
													r.groupName
												)[0] as HTMLInputElement
												checkbox.checked = false
											})

											// Uncheck the group
											const checkbox = document.querySelector(
												`input[data-type="${group.key}"][name="${element.name}"]`
											) as HTMLInputElement
											checkbox.checked = false
											checkbox.indeterminate = false
										}
									})

									updateStartButton()
								}}
							>
								No alternative
							</a>
						</div>
					</div>
				))}
			</div>

			{/* <!-- Start the quiz --> */}
			<div class="p-6 text-center">
				<button
					id="start-button"
					class="rounded-md bg-slate-400 p-2 px-4 transition-all hover:enabled:scale-105 disabled:opacity-75 dark:bg-slate-500"
					ref={startButton}
					disabled
					type="submit"
					aria-label="Start the quiz"
				>
					<span class="text-slate-100">Start the Quiz!</span>
				</button>
			</div>
		</form>
	)
}
