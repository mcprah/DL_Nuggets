import { Button } from "@nextui-org/react";
import AdminLayout from "../Layout/AdminLayout";
import { MdArrowRight } from "react-icons/md";
import Law from "~/images/img1.png";
import court from "~/images/img2.png";
import judge from "~/images/img3.png";

const Home = () => {
    return (
        <AdminLayout>
          <div className="flex items-center justify-center min-h-[86vh] w-full px-4">
              <div className="flex flex-col gap-4 w-full max-w-[90%] md:max-w-[70%] lg:max-w-[50%]">
                  <p className="font-montserrat text-2xl text-center">
                      Welcome Back, <b>Name</b>
                  </p>
                  <p className="font-nunito text-md text-center">How may we help you today?</p>

                  {/* Responsive Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {/* Card 1 */}
                      <div className="flex flex-col items-center gap-4 w-full">
                          <div className="bg-[#96FF96] border border-[#008000] flex items-center justify-center h-48 w-full rounded-xl">
                              <img className="h-20 w-20" src={Law} alt="Law" />
                          </div>
                          <Button endContent={<MdArrowRight className="text-xl" />} color="primary" className="w-full">
                              Area of Law
                          </Button>
                      </div>

                      {/* Card 2 */}
                      <div className="flex flex-col items-center gap-4 w-full">
                          <div className="bg-[#C5FFFF] border border-[#4646FF] flex items-center justify-center h-48 w-full rounded-xl">
                              <img className="h-20 w-20" src={court} alt="Court" />
                          </div>
                          <Button variant="bordered" endContent={<MdArrowRight className="text-xl" />} color="default" className="w-full">
                              Court
                          </Button>
                      </div>

                      {/* Card 3 */}
                      <div className="flex flex-col items-center gap-4 w-full">
                          <div className="bg-[#FFC0CB] border border-[#FF0000] flex items-center justify-center h-48 w-full rounded-xl">
                              <img className="h-20 w-20" src={judge} alt="Judge" />
                          </div>
                          <Button variant="bordered" endContent={<MdArrowRight className="text-xl" />} color="default" className="w-full">
                              Judges
                          </Button>
                      </div>
                  </div>
              </div>
          </div>
      </AdminLayout>
    );
};

export default Home;
