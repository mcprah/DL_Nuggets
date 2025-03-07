import { Button } from "@nextui-org/react"
import AdminLayout from "../Layout/AdminLayout"
import { MdArrowRight } from "react-icons/md"
import Law from "~/images/img1.png"
import court from "~/images/img2.png"
import judge from "~/images/img3.png"

const Home = () => {
    return (
        <AdminLayout>
            <div className="flex items-center justify-center h-[86vh] w-full">
                <div className="flex flex-col gap-4 ">
                    <p className="font-montserrat text-2xl text-center">Welcome Back, <b>Name</b></p>
                    <p className="font-nunito text-md text-center">How may we help you Today</p>
                    <div className="flex flex-col-3 w-[50vw] gap-10">
                        <div className="w-full flex flex-col gap-6">
                            <div className="bg-[#E5FFE5] border border-[#008000] flex items-center justify-center h-60 w-full rounded-xl">
                                <img className="h-20 w-20" src={Law} alt="" />
                            </div>
                            <Button
                                endContent={<MdArrowRight className="text-xl" />}
                                color="primary">
                                Area of Law
                            </Button>

                        </div>
                        <div className="w-full flex flex-col gap-6">
                            <div className="bg-[#C5FFFF] border border-[#008000] flex items-center justify-center h-60 w-full rounded-xl">
                                <img className="h-20 w-20" src={court} alt="" />
                            </div>
                            <Button
                                variant="bordered"
                                endContent={<MdArrowRight className="text-xl" />}
                                color="default">
                                Court
                            </Button>

                        </div>
                        <div className="w-full flex flex-col gap-6">
                            <div className="bg-[#E5FFE5] border border-[#008000] flex items-center justify-center h-60 w-full rounded-xl">
                                <img className="h-20 w-20" src={judge} alt="" />
                            </div>
                            <Button
                                variant="bordered"
                                endContent={<MdArrowRight className="text-xl" />}
                                color="default">

                                Judges
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
export default Home