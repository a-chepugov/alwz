/**
 * @ignore
 */
export class Registry<K, V> {
	protected _items: Map<K, V>;

	constructor() {
		this._items = new Map();
	}

	get(key: K): V | undefined {
		return this._items.get(key);
	}

	set(key: K, value: V) {
		this._items.set(key, value);
		return this;
	}

	del(key: K) {
		this._items.delete(key);
		return this;
	}

	has(key: K): boolean {
		return this._items.has(key);
	}

	values() {
		return this._items.values();
	}

	entries() {
		return this._items.entries();
	}

	get size() {
		return this._items.size;
	}

}

export default Registry;
