export type TypesMap = {
	undefined: undefined,
	boolean: boolean,
	number: number,
	bigint: bigint,
	string: string,
	symbol: symbol,
	object: object,
	function: Function,
};

export type Names = keyof TypesMap;
export type Types = TypesMap[keyof TypesMap];
export type Type<K> = K extends keyof TypesMap ? TypesMap[K] : never;

type TypeNamesEnum = {
	[Key in keyof TypesMap]: Key;
};

export const TypesEnum: TypeNamesEnum = {
	undefined: 'undefined',
	boolean: 'boolean',
	number: 'number',
	bigint: 'bigint',
	string: 'string',
	symbol: 'symbol',
	object: 'object',
	function: 'function',
};
