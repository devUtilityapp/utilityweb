import type { FunctionComponent } from "../../common/types";
import { useState } from "react";
import { Content } from "../../components/ui/Content";
import { MainForm } from "../../components/ui/MainForm";
import { MainInput } from "../../components/ui/MainInput";
import { toast } from "react-toastify";

interface DivisorDetail {
	number: number;
	isCommon: boolean;
}

interface LCMDetail {
	number: number;
	divisors: Array<DivisorDetail>;
}

// 두 수의 GCD를 구하는 헬퍼 함수를 컴포넌트 레벨로 이동
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

export const LCM = (): FunctionComponent => {
	const [lcmString, setLcmString] = useState<string>("");
	const [result, setResult] = useState<number | undefined>(undefined);
	const [lcmDetails, setLcmDetails] = useState<Array<LCMDetail>>([]);

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

	const calculateLCM = (event: React.FormEvent<HTMLFormElement>): void => {
		event.preventDefault();

		// 입력값을 숫자 배열로 변환
		const numbers = lcmString
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
		const details: Array<LCMDetail> = uniqueNumbers.map((number_) => ({
			number: number_,
			divisors: findDivisors(number_).map((divisor) => ({
				number: divisor,
				isCommon: false,
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
				isCommon: commonDivisors?.some((cd) => cd.number === divisor.number),
			})),
		}));

		// 배열의 모든 수에 대해 LCM 계산
		let lcmResult = uniqueNumbers[0];
		for (let index = 1; index < uniqueNumbers.length; index++) {
			const gcd = getGCD(lcmResult ?? 0, uniqueNumbers[index] ?? 0);
			lcmResult =
				Math.abs((lcmResult ?? 0) * (uniqueNumbers[index] ?? 0)) / gcd;
		}

		setLcmDetails(detailsWithCommon as Array<LCMDetail>);
		setResult(lcmResult);
	};

	return (
		<Content categoryName="Calculator" title="Least Common Multiple">
			<MainForm buttonText="calculate" onSubmit={calculateLCM}>
				<div className="w-5/6 h-full">
					<MainInput
						id="number"
						pattern="numbers-only"
						placeholder="75,90,135,625,7895"
						setValue={setLcmString}
						value={lcmString}
					/>
				</div>
			</MainForm>

			{/* 결과 표시 */}
			{result !== undefined && (
				<div className="flex flex-col gap-8">
					<div className="text-2xl font-bold text-center text-neutral-05">
						LCM: {result}
					</div>

					{/* LCM 계산 과정 표시 */}
					<div className="grid grid-cols-1 gap-6">
						{lcmDetails.map((detail, index) => {
							if (index === 0) return null; // 첫 번째 숫자는 건너뜀 (시작값)

							const previousNumber =
								index === 1
									? (lcmDetails[0]?.number ?? 0)
									: Math.abs(
											(lcmDetails[0]?.number ?? 0) *
												(lcmDetails[1]?.number ?? 0)
										) /
										getGCD(
											lcmDetails[0]?.number ?? 0,
											lcmDetails[1]?.number ?? 0
										);
							const currentNumber = detail.number;

							// 이전까지의 LCM 계산
							let runningLCM = previousNumber;
							for (let index_ = 2; index_ < index; index_++) {
								const gcd = getGCD(
									runningLCM ?? 0,
									lcmDetails[index_]?.number ?? 0
								);
								runningLCM =
									Math.abs(
										(runningLCM ?? 0) * (lcmDetails[index_]?.number ?? 0)
									) / gcd;
							}

							// 현재 숫자와의 GCD 계산
							const gcd = getGCD(runningLCM, currentNumber);
							// 현재까지의 LCM 계산
							const currentLCM = Math.abs(runningLCM * currentNumber) / gcd;

							// LCM 증명을 위한 계산
							const proofForPrevious = currentLCM / runningLCM;
							const proofForCurrent = currentLCM / currentNumber;

							return (
								<div
									key={detail.number}
									className="p-4 border bg-main-00 border-neutral-05 rounded-lg"
								>
									<h3 className="text-lg text-neutral-05 font-semibold mb-2">
										Step {index}
									</h3>
									<div className="text-sm text-neutral-05 space-y-2">
										<p>Previous LCM: {runningLCM}</p>
										<p>Current Number: {currentNumber}</p>
										<p>
											GCD({runningLCM}, {currentNumber}) = {gcd}
										</p>

										{/* LCM 계산 과정 */}
										<div className="flex flex-col">
											<p>
												LCM = |{runningLCM} × {currentNumber}| ÷ {gcd}
											</p>
											<p className="ml-6">
												= |{runningLCM * currentNumber}| ÷ {gcd}
											</p>
											<p className="ml-6">= {currentLCM}</p>
										</div>

										{/* LCM 증명 */}
										<div className="mt-4 p-3 bg-neutral-01 rounded-lg">
											<p className="font-semibold mb-2">Proof:</p>
											<div className="space-y-1">
												<p>
													{currentLCM} ÷ {runningLCM} = {proofForPrevious}{" "}
													(integer)
												</p>
												<p>
													{currentLCM} ÷ {currentNumber} = {proofForCurrent}{" "}
													(integer)
												</p>
												<p className="mt-2 text-green-05">
													{currentLCM} is the smallest number that is divisible
													by both {runningLCM} and {currentNumber}
												</p>
											</div>
										</div>

										{/* 이전 단계까지의 숫자들에 대한 검증 */}
										<div className="mt-2">
											<p className="font-semibold mb-1">
												Verification with all previous numbers:
											</p>
											{lcmDetails
												.slice(0, index + 1)
												.map((previousDetail, index_) => (
													<p key={index_}>
														{currentLCM} ÷ {previousDetail.number} ={" "}
														{currentLCM / previousDetail.number} (integer)
													</p>
												))}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</Content>
	);
};
