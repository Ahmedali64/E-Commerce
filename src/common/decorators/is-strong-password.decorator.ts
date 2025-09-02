import {
  registerDecorator,
  ValidationOptions,
  // ValidationArguments, u can make args: ValidationArguments to access data about the property
} from 'class-validator';

export function IsStrongPassword(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any /*args: ValidationArguments */) {
          if (typeof value !== 'string') return false;

          // Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
          const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
          return strongPasswordRegex.test(value);
        },
        defaultMessage() {
          return 'Password must be at least 8 characters long and contain uppercase, lowercase, and number';
        },
      },
    });
  };
}

// registerDecorator

//   target: Function;  //constructor is a function
//   propertyName: string; // ur property
//   name?: string | undefined; //decorator name
//   async?: boolean | undefined;
//   options?: ValidationOptions | undefined;
//   constraints?: any[];
//   validator: ValidatorConstraintInterface | Function;

//   ValidationArguments
//   {
//   value: "abc123",          // same as first param
//   targetName: "RegisterDto", // class name
//   object: { password: "abc123" }, // full object being validated
//   property: "password",     // the property name
//   constraints: [],          // extra options if you pass them
// }
