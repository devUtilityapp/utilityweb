import { useState } from "react";
import type { FunctionComponent } from "../../common/types";
import { Content } from "../../components/ui/Content";
import { MainForm } from "../../components/ui/MainForm";
import { MainInput } from "../../components/ui/MainInput";
import { toast } from "react-toastify";

interface DivisorDetail {
	number: number;
	isCommon: boolean;
}

interface GCDDetail {
	number: number;
	divisors: Array<DivisorDetail>;
}

export const GCD = (): FunctionComponent => {
	const [gcdString, setGcdString] = useState<string>("");
	const [result, setResult] = useState<number | undefined>(undefined);
	const [gcdDetails, setGcdDetails] = useState<Array<GCDDetail>>([]);

	// 약수 구하는 함수
	const findDivisors = (number_: number): Array<number> => {
		const divisors: Array<number> = [];
		const absNumber = Math.abs(number_);

		for (let index = 1; index <= absNumber; index++) {
			if (absNumber % index === 0) {
				divisors.push(index);
			}
		}

		return divisors;
	};

	const calculateGCD = (event: React.FormEvent<HTMLFormElement>): void => {
		event.preventDefault();

		// 입력값을 숫자 배열로 변환
		const numbers = gcdString
			.split(",")
			.map((number_) => Number(number_.trim()))
			.filter((number_) => !isNaN(number_) && number_ !== 0);

		// 중복 검사
		const uniqueNumbers = [...new Set(numbers)];
		if (numbers.length !== uniqueNumbers.length) {
			toast.error("Duplicate numbers are not allowed");
			return;
		}

		// 최소 2개 이상의 숫자 검사
		if (uniqueNumbers.length < 2) {
			toast.error("Please enter at least two different numbers");
			return;
		}

		// 각 숫자의 약수 계산
		const details: Array<GCDDetail> = uniqueNumbers.map((number_) => ({
			number: number_,
			divisors: findDivisors(number_).map((divisor) => ({
				number: divisor,
				isCommon: false, // 초기값은 false로 설정
			})),
		}));

		// 모든 숫자의 약수들의 교집합 구하기 (공약수)
		const commonDivisors = details[0]?.divisors.filter((divisor) =>
			details.every((detail) =>
				detail.divisors.some((d) => d.number === divisor.number)
			)
		);

		// 약수 정보에 공약수 여부 추가
		const detailsWithCommon = details.map((detail) => ({
			...detail,
			divisors: detail.divisors.map((divisor) => ({
				...divisor,
				isCommon:
					commonDivisors?.some((cd) => cd.number === divisor.number) ?? false,
			})),
		}));

		// 두 수의 GCD를 구하는 헬퍼 함수
		const getGCD = (a: number, b: number): number => {
			a = Math.abs(a);
			b = Math.abs(b);
			while (b !== 0) {
				const temporary = b;
				b = a % b;
				a = temporary;
			}
			return a;
		};

		// 배열의 모든 수에 대해 GCD 계산
		let gcdResult = uniqueNumbers[0];
		for (let index = 1; index < uniqueNumbers.length; index++) {
			gcdResult = getGCD(gcdResult ?? 0, uniqueNumbers[index] ?? 0);
		}

		setGcdDetails(detailsWithCommon);
		setResult(gcdResult);
	};

	return (
		<Content categoryName="Calculator" title="Greatest Common Divisor">
			<MainForm buttonText="calculate" onSubmit={calculateGCD}>
				<div className="w-5/6 h-full">
					<MainInput
						id="number"
						pattern="numbers-only"
						placeholder="75,90,135,625,7895"
						setValue={setGcdString}
						value={gcdString}
					/>
				</div>
			</MainForm>

			{/* 결과 표시 */}
			{result !== undefined && (
				<div className="flex flex-col gap-8">
					<div className="text-2xl font-bold text-center text-neutral-05">
						GCD: {result}
					</div>

					{/* 각 숫자의 약수 표시 */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{gcdDetails.map((detail) => (
							<div
								key={detail.number}
								className="p-4 border bg-main-00 border-neutral-05 rounded-lg"
							>
								<h3 className="text-lg text-neutral-05 font-semibold mb-2">
									Number: {detail.number}
								</h3>
								<div className="text-sm text-neutral-05">
									Divisors:{" "}
									{detail.divisors.map((divisor, index) => (
										<span key={divisor.number}>
											{index > 0 && ", "}
											<span
												className={
													divisor.isCommon
														? "text-green-05 font-semibold"
														: "text-neutral-05"
												}
											>
												{divisor.number}
											</span>
										</span>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</Content>
	);
};
