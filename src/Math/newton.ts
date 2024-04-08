import { create, all, type MathNode } from "mathjs";
import { ref } from "vue";

const config = {};
const math = create(all, config);

export function useNewton() {
    const valid = ref<boolean>(false);
    const noZero = ref<boolean>(false);
    const functionString = ref<string>("");
    const functionParsed = ref<MathNode>();

    const triedPoints = ref<Array<{
        startingX: number;
        startingY: number;
        tgX: number;
        tgY: number;
        
    }>>([]);

    function setFunction(fn: string) {
        if (fn === "") {
            valid.value = false;
            return;
        }
        try {
            functionString.value = fn;
            functionParsed.value = math.parse(fn);
            valid.value = true;
        } catch (e) {
            valid.value = false;
        }
        return;
    }

    function f(x: number) {
        return functionParsed.value?.evaluate({ x });
    }

    function derivate(depth: number = 1) {
        var result = math.parse(functionString.value);
        for (let i = 0; i < depth; i++) {
            result = math.derivative(result, "x");
        }
        return result;
    }

    /**
     * Algoritmo de Newton
     */
    function newton(fn: MathNode, a: number, b: number, error: number) {
        noZero.value = false;
        triedPoints.value = [];

        //Retorna a derivada segunda da função
        let derivateSecond = derivate(2);

        //Erro não pode ser 0
        if (error <= 0.000000000000001) {
            error = 0.1;
        }

        //Verifica se os pontos a e b convergem em 0
        if (fn.evaluate({ x: a }) * fn.evaluate({ x: b }) > 0) {
            noZero.value = true;
            return;
        }

        //Verifica se "a" está fora da concavidade
        if (derivateSecond.evaluate({ x: a }) * fn.evaluate({ x: b }) < 0)
            var xn = a;
        else var xn = b;


        let firstTg = {
            startingX: xn,
            startingY: fn.evaluate({ x: xn }),
            tgX: 0,
            tgY: 0
        }
        //Primeira iteração
        xn = xn - fn.evaluate({ x: xn }) / derivate().evaluate({ x: xn });
        firstTg.tgX = xn;
        triedPoints.value.push(firstTg);


        //Iterações seguintes
        while (Math.abs(fn.evaluate({ x: xn })) > error) {
            let tgs = {
                startingX: xn,
                startingY: fn.evaluate({ x: xn }),
                tgX: 0,
                tgY: 0
            }

            xn = xn - fn.evaluate({ x: xn }) / derivate().evaluate({ x: xn });
            tgs.tgX = xn;
            triedPoints.value.push(tgs);
        }

        return xn;
    }

    return { f, setFunction, derivate, valid, noZero, functionParsed, newton, triedPoints };
}
