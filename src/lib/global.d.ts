interface String {
  concat<S extends string>(string: S): `${this}${S}`;
  concat<S1 extends string, S2 extends string>(s1: S1, s2: S2): `${this}${S1}${S2}`;
  startsWith<S extends string>(searchString: S): this is `${S}${string}`;
  endsWith<S extends string>(searchString: S): this is `${string}${S}`;
  includes<S extends string>(searchString: S, position?: number): this is `${string}${S}${string}`;
}

interface ReadonlyArray {
  includes(searchElement: unknown): searchElement is this[number];
}
