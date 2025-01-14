export class Regex{
    static emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/; //formato email classico
    static usernameRegex = /^[a-zA-Z0-9_]{3,20}$/; //alfanumerico, da 3 a 20 caratteri
    static passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,16}$/; //almeno un minuscolo, un maiuscolo, una cifra e un carattere speciale, da 8 a 16 caratteri
}

