import { stage, $stage1 } from '../stores/quiz.js'
import { kanaDictionary } from '../data/kanaDic'
import { useEffect, useRef } from 'preact/hooks'
import { render } from 'preact'
export default function Stage1() {
	// HTML Refs
	const descriptionRef = useRef(null)
	const parentRef = useRef(null)

	// Active question ref
	var activeQuestion = useRef(null)

	var questionsAnsweredRight = 0
	const maxQuestions = 5

	// Once the component mounts, start the entry animation
	useEffect(() => {
		// Shows the description
		if (descriptionRef.current && parentRef.current) {
			descriptionRef.current.classList.remove('opacity-0')
			descriptionRef.current.classList.add('animate-fade-in')
			setTimeout(() => {
				// Hides the description
				descriptionRef.current.classList.remove('animate-fade-in')
				descriptionRef.current.classList.add('animate-fade-out')
				descriptionRef.current.classList.add('opacity-0')
				// Shows the questions
				setTimeout(() => {
					descriptionRef.current.classList.add('hidden')
					parentRef.current.classList.remove('opacity-0')
					parentRef.current.classList.add('animate-fade-in')
				}, 500)
			}, 1000)
		}

		/**
		 * Question logic
		 */

		// $stage1 data subscription
		var selectedOptions = []
		$stage1.subscribe((value) => {
			if (value.selectedOptions) selectedOptions = JSON.parse(value.selectedOptions)
		})

		// All selected groups on the last screen from the KanaDictionary
		const allSelectedGroups = {}

		// All the kanas from the selected groups
		let allKanas = {}
		let allRomaji = []

		Object.keys(kanaDictionary).forEach((kanaType) => {
			Object.keys(kanaDictionary[kanaType]).forEach((key) => {
				// If the key is included on the selectedOptions array, add it to the allSelectedGroups object
				if (selectedOptions.includes(key)) {
					const group = kanaDictionary[kanaType][key]
					// add it to the Selected Groups
					allSelectedGroups[key] = group

					// add it to the All Kanas
					allKanas = Object.assign(allKanas, group['characters'])

					// let's add all askable kana keys to array
					Object.keys(group['characters']).forEach((key) => {
						allRomaji.push(group['characters'][key][0])
					})
				}
			})
		})

		// Separate all Unique Romaji for options
		var _allUniqueRomaji = allRomaji.filter((item, index) => allRomaji.indexOf(item) === index)

		/**
		 * Generates a random property from an object.
		 *
		 * @param {Record<string, any>} obj - The object to generate a random property from.
		 * @return {string} The randomly selected property from the object.
		 */
		const getRandomProperty = (obj: Record<string, any>) => {
			// Get all the keys of the object
			const keys = Object.keys(obj)
			// Select a random index based on the length of the keys
			const randomIndex = Math.floor(Math.random() * keys.length)
			// Return the property at the randomly selected index
			return keys[randomIndex]
		}

		/**
		 * Generates a specified number of questions with options, randomly selecting from the selected kanas.
		 *
		 * @param {number} quantity - The number of questions to generate.
		 * @return {Array<{ id: number; question: string; options: Array<{ isRight: boolean; value: string }> }>} An array of questions, each containing an id, a question string, and an array of options.
		 */
		const generateQuestions = (
			quantity: number
		): Array<{
			id: number
			question: string
			options: Array<{ isRight: boolean; value: string }>
		}> => {
			const questions: Array<{
				id: number
				question: string
				options: Array<{ isRight: boolean; value: string }>
			}> = []

			for (let i = 0; i < quantity; i++) {
				const remainingRomaji = [..._allUniqueRomaji]
				// Select a random question from the selected kanas
				const question = getRandomProperty(allKanas)
				const options: Array<{ isRight: boolean; value: string }> = [
					{ isRight: true, value: allKanas[question][0] }
				]

				const rightAnswerIndex = remainingRomaji.indexOf(allKanas[question][0])
				if (rightAnswerIndex > -1) {
					// Remove the right answer from the remaining romaji
					remainingRomaji.splice(rightAnswerIndex, 1)
				}

				for (let j = 0; j < 2; j++) {
					const randomIndex = Math.floor(Math.random() * remainingRomaji.length)
					// Add random option to the options array
					options.push({ isRight: false, value: remainingRomaji.splice(randomIndex, 1)[0] })
				}

				// Add the question and its options to the questions array
				questions.push({ id: i + 1, question, options })
			}

			return questions
		}

		// Generate a pool of questions
		const questions = generateQuestions(500)

		// Set up the active question
		activeQuestion.current = questions[0]

		// The pool of previous questions
		let prevQuestions = []

		// Generate the HTML template for the activeQuestion
		const setTemplate = (parentRef, targetQuestion: any) => {
			// Set the template in the parent div
			render(
				<>
					{/* <!-- Previous Result / Question --> */}
					{prevQuestions.length == 0 && (
						<div
							id="previous_result"
							class="mx-auto block w-2/5 min-w-80 rounded-lg border-2 bg-slate-200 py-2 text-center dark:bg-slate-800"
						>
							<h1 class="text-base lg:text-lg">Let's go! Which character is this?</h1>
						</div>
					)}
					{/* <!-- Previous Result Correct --> */}
					{prevQuestions.length > 0 &&
						prevQuestions[prevQuestions.length - 1].chosenOption.isRight && (
							<div
								id="previous_result correct"
								class="mx-auto block w-2/5 min-w-80 rounded-lg border-2 bg-green-400 py-2 text-center dark:bg-green-700"
							>
								<h1 class="text-base lg:text-lg">
									{`${prevQuestions[prevQuestions.length - 1].question} = ${
										prevQuestions[prevQuestions.length - 1].options.find((option) => option.isRight)
											.value
									}`}
								</h1>
							</div>
						)}
					{/* <!-- Previous Result Wrong --> */}
					{prevQuestions.length > 0 &&
						!prevQuestions[prevQuestions.length - 1].chosenOption.isRight && (
							<div
								id="previous_result wrong"
								class="mx-auto block w-2/5 min-w-80 rounded-lg border-2 bg-red-400 py-2 text-center dark:bg-red-800"
							>
								<h1 class="text-base lg:text-lg">
									{`${prevQuestions[prevQuestions.length - 1].question} = ${
										prevQuestions[prevQuestions.length - 1].options.find((option) => option.isRight)
											.value
									}`}
								</h1>
							</div>
						)}

					{/* <!-- Character  --> */}
					<div id="character" class="my-16 mt-12 text-center lg:my-20 lg:mt-16">
						<h1 class="align-middle font-jp text-8xl lg:text-9xl">
							<span aria-label={`Character ${targetQuestion.question}`}>
								{targetQuestion.question}
							</span>
						</h1>
					</div>

					{/* <!-- Answers --> */}
					<div id="answers" class="mx-auto grid w-2/5 min-w-80 grid-cols-3 gap-10 xl:gap-20">
						{targetQuestion.options
							.sort(() => Math.random() - 0.5)
							.map((option) => (
								<button
									class="rounded-lg border-2 bg-slate-200 py-4 text-lg transition-colors hover:bg-slate-400 dark:bg-slate-800 dark:hover:bg-slate-600 xl:text-2xl"
									aria-label={`Answer ${option.value}`}
									onClick={() => {
										// Mark the chosen option on the active question
										activeQuestion.current.chosenOption = option

										// Update the questions answered right
										if (option.isRight) {
											questionsAnsweredRight++
										} else if (questionsAnsweredRight > 0) {
											questionsAnsweredRight--
										}

										// Store the previous questions
										prevQuestions.push(activeQuestion.current)

										// Change the active question
										activeQuestion.current =
											questions[questions.indexOf(activeQuestion.current) + 1]

										// Set the template in the parent div
										setTemplate(parentRef, activeQuestion.current)

										// Play audio based on the chosen option
										if (option.isRight) {
											new Audio('/public/correct.mp3').play()
										} else {
											new Audio('/public/incorrect.mp3').play()
										}

										// Check if all questions have been answered
										if (maxQuestions == questionsAnsweredRight) {
											// Play success audio
											new Audio('/public/success.mp3').play()

											// Play animation
											parentRef.current.classList.add('animate-pulse')

											// Wait 3 seconds
											setTimeout(() => {
												// Set the stage
												stage.set('2')

												// Redirect to stage 2
												window.location.href = '/quiz/2'
											}, 3000)
										}
									}}
								>
									{option.value}
								</button>
							))}
					</div>

					{/* <!-- Progress --> */}
					<div
						id="progress"
						class=""
						className={
							questionsAnsweredRight == 0
								? `mt-12 opacity-0 transition-opacity`
								: `mt-12 opacity-100 transition-opacity`
						}
					>
						<div class="w-full rounded-full bg-slate-200/25 dark:bg-slate-700/25">
							<div
								class="min-h-4 rounded-full bg-slate-600 p-0.5 text-center text-xs font-medium leading-none text-blue-100 transition-all"
								style={{
									width: `${((questionsAnsweredRight / maxQuestions) * 100).toFixed(0).toString()}%`
								}}
							>
								{(questionsAnsweredRight / maxQuestions) * 100 > 0 &&
									`${((questionsAnsweredRight / maxQuestions) * 100).toFixed(0).toString()}%`}
							</div>
						</div>
					</div>
				</>,
				parentRef.current
			)
		}

		// Put the template in the parent div
		setTemplate(parentRef, activeQuestion.current)
	}, [])

	return (
		<>
			{/* <!-- Stage Description --> */}
			<div
				id="description"
				ref={descriptionRef}
				class="py-5 text-center opacity-0 transition-opacity"
			>
				<h1 class="mb-4 text-2xl lg:text-4xl">Stage 1</h1>
				<p class="text-lg lg:text-xl">Choose one option!</p>
			</div>

			{/* <!-- Parent div --> */}
			<div id="parent" ref={parentRef} class="opacity-0 transition-opacity"></div>
		</>
	)
}
