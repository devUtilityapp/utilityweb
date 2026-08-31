import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { FunctionComponent } from "../../common/types";
import { useSeo } from "../../common/useSeo";
import { Header } from "./Header/Header";
import { Sidebar } from "./Sidebar/Sidebar";

/**
 * 모든 화면을 감싸는 껍데기.
 * 404 화면도 같은 껍데기를 써야 헤더와 도구 목록이 그대로 남는다.
 */
export const AppLayout = ({
	children,
}: {
	children: React.ReactNode;
}): FunctionComponent => {
	useSeo();

	return (
		<div className="min-h-screen bg-main-00">
			<Header />
			<main className="mt-16 flex justify-center">
				<Sidebar />
				<div className="lg:w-1/6 lg:block sm:hidden"></div>
				<div className="container lg:py-20 py-10 lg:px-14 px-8 box-border lg:w-2/3 sm:w-full">
					{children}
				</div>
				<div className="lg:w-1/6 lg:block sm:hidden"></div>
			</main>

			<ToastContainer />
		</div>
	);
};
