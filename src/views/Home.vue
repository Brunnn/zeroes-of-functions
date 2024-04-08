<script setup lang="ts">
import { useNewton } from "@/Math/newton";
import { ref, watch, watchEffect } from "vue";
import Plotly, { type Data, type TypedArray } from "plotly.js-dist-min";
import { create, all, type MathNode } from "mathjs";
const config = {};
const math = create(all, config);
const { setFunction, f, derivate, valid, noZero, functionParsed, newton, triedPoints } =
    useNewton();

const fn = ref<string>("");
const a = ref<number | null>(null);
const b = ref<number | null>(null);

watchEffect(() => {
    if (valid.value) drawChart(functionParsed.value!, a.value, b.value);
});

function set() {
    setFunction(fn.value);
    if (valid.value) drawChart(functionParsed.value!, a.value, b.value);
}

function drawChart(expression: MathNode, a: number | null, b: number | null) {
    try {
        const expr = expression.compile();

        // evaluate the expression repeatedly for different values of x
        let min = -10;
        let max = 10;
        //Desenha um gráfico de acordo com a distacia entre a e b
        if (a && b) {
            min = Math.min(a, b) - 1;
            max = Math.max(a, b) + 1;
        } else if (a) {
            min = a - 5;
            max = a + 5;
        } else if (b) {
            min = b - 5;
            max = b + 5;
        }


        //Pontos da função
        const xValues = math.range(min, max, 0.001).toArray() as any[];
        const yValues = xValues.map(function (x) {
            return expr.evaluate({ x: x });
        });

        const data: Data[] = [];
        const functionGraph: Data = {
            x: xValues,
            y: yValues,
            type: "scatter",
            name: "f(x)",
        };
        data.push(functionGraph);

        if (a) {
            const trace2: Data = {
                x: [a],
                y: [expr.evaluate({ x: a })],
                type: "scatter",
                mode: "markers",
                line: { color: "red" },
                name: "a",
            };
            data.push(trace2);
        }

        if (b) {
            const trace3: Data = {
                x: [b],
                y: [expr.evaluate({ x: b })],
                type: "scatter",
                mode: "markers",
                line: { color: "green" },
                name: "b",
            };
            data.push(trace3);
        }

        //Desenha as tangentes e pontos gerados pelo algoritmo de newton
        //Traçando uma reta tangente de [triedPoints.startingX,triedPoints.startingY] até [triedPoints.tgX,triedPoints.tgY]
        if (triedPoints.value && a && b) {
            for (let i = 0; i < triedPoints.value.length; i++) {
                const trace: Data = {
                    x: [triedPoints.value[i].startingX, triedPoints.value[i].tgX],
                    y: [triedPoints.value[i].startingY, triedPoints.value[i].tgY],
                    type: "scatter",
                    mode: "lines",
                    line: { color: "blue" },
                    name: `tg ${i + 1}`,
                };
                data.push(trace);

                const trace2: Data = {
                    x: [triedPoints.value[i].tgX],
                    y: [triedPoints.value[i].tgY],
                    type: "scatter",
                    mode: "markers",
                    line: { color: "blue" },
                    name: `x${i + 1}`,
                };
                data.push(trace2);
            }
        }

        Plotly.newPlot(
            "plot",
            data,
            {
                showlegend: true,
            },
            {
                responsive: true,
            }
        );
    } catch (err) {
        console.error(err);
        alert(err);
    }
}

const error = ref<number>(0.00001);
</script>

<template>
    <div class="container p-4 flex flex-col mx-auto">
        <div class="flex flex-col w-full items-center">
            <div class="flex flex-row w-full justify-center">
                <input
                    id="function"
                    type="text"
                    v-model="fn"
                    label="Função"
                    placeholder="Função"
                    class="block w-full max-w-36 rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                />
                <button
                    @click="set"
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Alterar
                </button>

                <div class="flex flex-row gap-3 pl-3">
                    <input
                        id="a"
                        v-model="a"
                        type="number"
                        label="a"
                        placeholder="a"
                        class="graph-points block w-12 text-center rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                    />

                    <input
                        id="b"
                        v-model="b"
                        type="number"
                        label="b"
                        placeholder="b"
                        class="graph-points block w-12 text-center rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                    />

                    <input
                        id="erro"
                        v-model="error"
                        type="number"
                        label="erro"
                        placeholder="Erro"
                        class="graph-points block w-28 text-center rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                    />
                </div>
            </div>
            <div class="answers w-full" v-if="valid">
                <div>f'(x) = {{ derivate(1) }}</div>
                <div>f''(x) = {{ derivate(2) }}</div>
                <div
                    class="bg-teal-100 border-t-4 border-teal-500 rounded-b text-teal-900 px-4 py-3 shadow-md"
                    role="alert"
                    v-if="functionParsed && a && b && error"
                    v-show="!noZero && valid"
                >
                    x = {{ newton(functionParsed, a, b, error) }}
                </div>
                <div
                    class="bg-red-500 text-white font-bold rounded-t px-4 py-2"
                    v-if="!valid"
                >
                    A função não é valida.
                </div>
                <div
                    class="bg-red-500 text-white font-bold rounded-t px-4 py-2"
                    v-if="noZero"
                >
                    Os pontos não convergem em um zero de função
                </div>
            </div>
        </div>
        <div id="plot" class="w-full"></div>
    </div>
</template>

<style lang="scss">
.v-field__input {
    font-size: 18px;
}

.graph-points::-webkit-outer-spin-button,
.graph-points::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Firefox */
.graph-points[type="number"] {
    -moz-appearance: textfield;
}
</style>
