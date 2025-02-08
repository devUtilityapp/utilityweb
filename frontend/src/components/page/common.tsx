import { useState } from "react";
import type { FunctionComponent } from "../../common/types";

export const PageTitle = ({ name }: { name: string }): FunctionComponent => {
	return (
		<div className="text-2xl font-medium text-neutral-05 mb-10">{name}</div>
	);
};

export const CustomSelect = ({
	currentValue,
	options,
	onChange,
}: {
	currentValue: string;
	options: Array<string>;
	onChange: (value: string) => void;
}): FunctionComponent => {
	const [open, setOpen] = useState(false);

	const handleSelect = (): void => {
		setOpen(!open);
	};

	const handleOptionClick = (value: string): void => {
		onChange(value);
		setOpen(false);
	};

	return (
		<div
			className={`relative h-full flex items-center bg-main-00 border border-neutral-05 rounded-xl min-w-[100px] ${
				open ? "border-bottom-radius-none" : ""
			}`}
		>
			<div
				className="flex items-center justify-between w-full h-full px-3 cursor-pointer"
				onClick={handleSelect}
			>
				<div className="text-neutral-05 font-medium select-none">
					{currentValue}
				</div>

				<svg
					className={`${open ? "rotate-180" : ""} transition-all duration-300`}
					fill="none"
					height="20"
					viewBox="0 0 20 20"
					width="20"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						clipRule="evenodd"
						d="M10 12.7587L14.8175 7.9425L13.9337 7.0575L10 10.9912L6.0675 7.0575L5.1825 7.9425L10 12.7587Z"
						fill="#F7F7F7"
						fillRule="evenodd"
					/>
				</svg>
			</div>

			{open && (
				<div className="options_contianer absolute border-top-radius-none border border-neutral-05 translate-y-full bottom-0 left-0 min-w-[100px] w-full bg-main-00 rounded-xl flex flex-col gap-2 py-3 overflow-hidden h-max left-[-1px] z-10">
					{options.map((option, index) => {
						const value = option;
						if (!value) return null;

						return (
							<div
								key={value}
								className={`select-none text-neutral-05 font-medium border-b border-neutral-15 pb-3 px-3 cursor-pointer ${
									index === options.length - 1 ? "border-b-0 pb-0" : ""
								}`}
								onClick={() => {
									handleOptionClick(value);
								}}
							>
								{option}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};
