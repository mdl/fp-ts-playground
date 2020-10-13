import {chain, Either, getValidation, left, map, mapLeft, right} from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'
import {getSemigroup, NonEmptyArray} from "fp-ts/NonEmptyArray";
import {sequenceT} from "fp-ts/Apply";

// https://dev.to/gcanti/getting-started-with-fp-ts-either-vs-validation-5eja

const minLength = (s: string): Either<string, string> =>
  s.length >= 6 ? right(s) : left('at least 6 characters')

const oneCapital = (s: string): Either<string, string> =>
  /[A-Z]/g.test(s) ? right(s) : left('at least one capital letter')

const oneNumber = (s: string): Either<string, string> =>
  /[0-9]/g.test(s) ? right(s) : left('at least one number')

// fail-fast-style of validation
const validatePassword1 = (s: string): Either<string, string> =>
  pipe(
    minLength(s),
    chain(oneCapital),
    chain(oneNumber)
  )

// console.log(validatePassword1('ab'))
// => left("at least 6 characters")

// console.log(validatePassword1('abcdef'))
// => left("at least one capital letter")

// console.log(validatePassword1('Abcdef'))
// => left("at least one number")

const applicativeValidation = getValidation(getSemigroup<string>())

// let's define a combinator that converts a check
// outputting an Either<E, A> into a check outputting a Either<NonEmptyArray<E>, A>
function lift<E, A>(check: (a: A) => Either<E, A>): (a: A) => Either<NonEmptyArray<E>, A> {
  return a => pipe(check(a), mapLeft(a => [a]))
}

const minLengthV = lift(minLength)
const oneCapitalV = lift(oneCapital)
const oneNumberV = lift(oneNumber)

function validatePassword2(s: string): Either<NonEmptyArray<string>, string> {
  return pipe(
    sequenceT(applicativeValidation)(minLengthV(s), oneCapitalV(s), oneNumberV(s)),
    map(() => s)
  )
}

console.log(validatePassword2('ab'))


