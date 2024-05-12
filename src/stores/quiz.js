import { persistentAtom, persistentMap } from '@nanostores/persistent'

export const stage = persistentAtom('stage', 0)

export const $stage1 = persistentMap('stage0', {
	selectedOptions: '' // Value will be encoded by JSON.stringify (eg: JSON.stringify(['stuff', 'here']))
})
