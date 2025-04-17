enum VersionComparsion {
    GREATER,
    EQUAL,
    LESS
}

export class Version {

    static readonly FIRST = new Version([1, 0, 0])

    constructor(
        readonly indexes: number[]
    ) { }

    static fromString(string: string): Version {
        return new Version(string.split('.').map((s) => Number(s)))
    }

    protected compare(version: Version): VersionComparsion {
        if(this.indexes.length === version.indexes.length) {
            for(let i = 0; i < this.indexes.length; i++) {
                if(this.indexes[i] > version.indexes[i]) {
                    return VersionComparsion.GREATER
                } else if(this.indexes[i] < version.indexes[i]) {
                    return VersionComparsion.LESS
                }
            }
            return VersionComparsion.EQUAL
        }
        return this.indexes.length > version.indexes.length ? VersionComparsion.GREATER : VersionComparsion.LESS
    }

    next(): Version {
        let nextIndexes = [...this.indexes]
        nextIndexes[nextIndexes.length -1]++
        return new Version(nextIndexes)
    }

    isGreater(version: Version): boolean {
        return this.compare(version) === VersionComparsion.GREATER
    }

    equals(version: Version): boolean {
        return this.compare(version) === VersionComparsion.EQUAL
    }

    isLess(version: Version): boolean {
        return this.compare(version) === VersionComparsion.LESS
    }

    toString(): string {
        return this.indexes.join('.')
    }
}