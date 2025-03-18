import { useState } from "react";
import { json, LoaderFunction } from "@remix-run/node";
import {
  useLoaderData,
  useNavigate,
  ClientLoaderFunctionArgs,
} from "@remix-run/react";
import AdminLayout from "~/Layout/AdminLayout";
import { MdArrowBack, MdAdd, MdDelete, MdEdit, MdClose } from "react-icons/md";
import {
  Pagination,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Textarea,
  Spinner,
} from "@nextui-org/react";
import axios from "axios";
import NuggetDrawer, { Nugget } from "~/components/NuggetDrawer";

// Define the server loader data type
interface ServerLoaderData {
  baseUrl: string;
}

// Define the client loader return type
interface ClientLoaderData {
  nuggets: Nugget[];
  totalPages: number;
  currentPage: number;
  perPage: number;
  error: string | null;
}

// Server loader - gets base URL but doesn't try to authenticate
export const loader: LoaderFunction = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_DL_LIVE_URL;
  return { baseUrl };
};

// Client loader that runs on the client side and can access localStorage
export const clientLoader = async ({
  request,
  params,
  serverLoader,
}: ClientLoaderFunctionArgs) => {
  // Get data from server loader
  const { baseUrl } = await serverLoader<ServerLoaderData>();

  // Get token from localStorage (only available in browser)
  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("access_token");
  }

  if (!token) {
    return {
      nuggets: [],
      totalPages: 0,
      currentPage: 1,
      perPage: 10,
      error: "Not authenticated",
    };
  }

  try {
    // Make authenticated request
    const url = new URL(request.url);
    const page = url.searchParams.get("page") || "1";

    const response = await axios.get(
      `${baseUrl}/personal-nuggets?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(response.data);

    return {
      nuggets: response.data?.data || [],
      totalPages: response.data?.meta?.last_page || 1,
      currentPage: parseInt(page),
      perPage: response.data?.meta?.per_page || 10,
      error: null,
    };
  } catch (error: any) {
    console.error("Error fetching user nuggets:", error);
    return {
      nuggets: [],
      totalPages: 0,
      currentPage: 1,
      perPage: 10,
      error: error.response?.data?.message || "Failed to fetch nuggets",
    };
  }
};

// Set hydrate to true since we need client data on initial load
clientLoader.hydrate = true;

interface NuggetFormData {
  title: string;
  principle: string;
  year?: string;
  citation_no?: string;
}

export default function MyNuggets() {
  const { nuggets, totalPages, currentPage, error, baseUrl } =
    useLoaderData<ClientLoaderData>();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedNugget, setSelectedNugget] = useState<Nugget | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteConfirmOpen,
    onOpen: onDeleteConfirmOpen,
    onClose: onDeleteConfirmClose,
  } = useDisclosure();
  const [formData, setFormData] = useState<NuggetFormData>({
    title: "",
    principle: "",
    year: "",
    citation_no: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [nuggetToDelete, setNuggetToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Open drawer with selected nugget details
  const openDrawer = (nugget: Nugget) => {
    setSelectedNugget(nugget);
    setIsDrawerOpen(true);
  };

  // Close drawer
  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Handle bookmark changes
  const handleBookmarkChange = () => {
    // Force re-render to refresh the list
    setRefreshKey((prev) => prev + 1);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open edit modal with nugget data
  const openEditModal = (nugget: Nugget) => {
    setFormData({
      title: nugget.title || "",
      principle: nugget.principle || "",
      year: nugget.year ? String(nugget.year) : "",
      citation_no: nugget.citation_no || nugget.dl_citation_no || "",
    });
    setSelectedNugget(nugget);
    onEditOpen();
  };

  // Add new personal nugget
  const addPersonalNugget = async () => {
    if (!formData.title || !formData.principle) {
      setFormError("Title and principle are required");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setFormError("You must be logged in to add a nugget");
        setIsSubmitting(false);
        return;
      }

      await axios.post(`${baseUrl}/personal-nugget`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Reset form and close modal
      setFormData({
        title: "",
        principle: "",
        year: "",
        citation_no: "",
      });
      onClose();

      // Refresh the list by forcing React to re-render
      setRefreshKey((prev) => prev + 1);

      // In a real app, you'd want to refresh the data from the API
      navigate("/my-nuggets");
    } catch (error: any) {
      console.error("Error adding personal nugget:", error);
      setFormError(
        error.response?.data?.message ||
          "Failed to add nugget. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update personal nugget
  const updatePersonalNugget = async () => {
    if (!selectedNugget || !formData.title || !formData.principle) {
      setFormError("Title and principle are required");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setFormError("You must be logged in to update a nugget");
        setIsSubmitting(false);
        return;
      }

      await axios.put(
        `${baseUrl}/personal-nugget/${selectedNugget.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Reset form and close modal
      setFormData({
        title: "",
        principle: "",
        year: "",
        citation_no: "",
      });
      onEditClose();

      // Refresh the list by forcing React to re-render
      setRefreshKey((prev) => prev + 1);

      // In a real app, you'd want to refresh the data from the API
      navigate("/my-nuggets");
    } catch (error: any) {
      console.error("Error updating personal nugget:", error);
      setFormError(
        error.response?.data?.message ||
          "Failed to update nugget. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete personal nugget
  const deletePersonalNugget = async () => {
    if (!nuggetToDelete) return;

    setIsDeleting(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      await axios.delete(`${baseUrl}/personal-nugget/${nuggetToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Close modal and refresh list
      onDeleteConfirmClose();

      // Refresh the list by forcing React to re-render
      setRefreshKey((prev) => prev + 1);

      // In a real app, you'd want to refresh the data from the API
      navigate("/my-nuggets");
    } catch (error) {
      console.error("Error deleting personal nugget:", error);
    } finally {
      setIsDeleting(false);
      setNuggetToDelete(null);
    }
  };

  // Delete all personal nuggets
  const deleteAllPersonalNuggets = async () => {
    if (
      !confirm(
        "Are you sure you want to delete all your personal nuggets? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      await axios.delete(`${baseUrl}/personal-nuggets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh the list by forcing React to re-render
      setRefreshKey((prev) => prev + 1);

      // In a real app, you'd want to refresh the data from the API
      navigate("/my-nuggets");
    } catch (error) {
      console.error("Error deleting all personal nuggets:", error);
    }
  };

  // Prepare to delete a nugget
  const confirmDelete = (nuggetId: number) => {
    setNuggetToDelete(nuggetId);
    onDeleteConfirmClose();
  };

  if (error === "Not authenticated") {
    return (
      <AdminLayout>
        <div className="p-6 bg-white rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold mb-4">My Nuggets</h1>
          <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
            <p>You need to be logged in to view your nuggets.</p>
            <Button
              color="primary"
              className="mt-4"
              onClick={() => navigate("/")}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-600 hover:text-primary transition-all duration-300"
            >
              <MdArrowBack className="text-2xl" />
            </button>
            <h1 className="text-2xl font-bold">My Nuggets</h1>
          </div>
          <div className="flex gap-2">
            <Button color="primary" startContent={<MdAdd />} onClick={onOpen}>
              Add Nugget
            </Button>
            {nuggets?.length > 0 && (
              <Button
                color="danger"
                variant="light"
                onClick={deleteAllPersonalNuggets}
              >
                Delete All
              </Button>
            )}
          </div>
        </div>

        {error && error !== "Not authenticated" && (
          <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-lg border border-red-200">
            <p>{error}</p>
          </div>
        )}

        {nuggets?.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">
              You haven't created any personal nuggets yet.
            </p>
            <Button color="primary" onClick={onOpen}>
              Create Your First Nugget
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nuggets?.map((nugget) => (
                <Card
                  key={`${nugget.id}-${refreshKey}`}
                  className="h-full shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardHeader className="flex justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        {nugget.citation_no || nugget.dl_citation_no}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {nugget.year && (
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                          {nugget.year}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardBody
                    className="cursor-pointer"
                    onClick={() => openDrawer(nugget)}
                  >
                    <h3 className="font-semibold line-clamp-2 mb-2">
                      {nugget.headnote || nugget.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {nugget.principle}
                    </p>
                  </CardBody>
                  <CardFooter className="flex justify-between">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        isIconOnly
                        variant="light"
                        color="primary"
                        onClick={() => openEditModal(nugget)}
                      >
                        <MdEdit />
                      </Button>
                      <Button
                        size="sm"
                        isIconOnly
                        variant="light"
                        color="danger"
                        onClick={() => {
                          setNuggetToDelete(nugget.id);
                          onDeleteConfirmOpen();
                        }}
                      >
                        <MdDelete />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      onClick={() => openDrawer(nugget)}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  total={totalPages}
                  initialPage={currentPage}
                  onChange={(page) => navigate(`/my-nuggets?page=${page}`)}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Nugget Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add New Nugget
              </ModalHeader>
              <ModalBody>
                {formError && (
                  <div className="p-2 mb-4 bg-red-50 text-red-600 rounded-md text-sm">
                    {formError}
                  </div>
                )}
                <Input
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter nugget title"
                  variant="bordered"
                  isRequired
                />
                <Textarea
                  label="Principle"
                  name="principle"
                  value={formData.principle}
                  onChange={handleInputChange}
                  placeholder="Enter the legal principle"
                  minRows={4}
                  variant="bordered"
                  isRequired
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="YYYY"
                    variant="bordered"
                    type="number"
                  />
                  <Input
                    label="Citation Number"
                    name="citation_no"
                    value={formData.citation_no}
                    onChange={handleInputChange}
                    placeholder="Optional citation number"
                    variant="bordered"
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={addPersonalNugget}
                  isLoading={isSubmitting}
                  isDisabled={!formData.title || !formData.principle}
                >
                  Save Nugget
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Nugget Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Nugget
              </ModalHeader>
              <ModalBody>
                {formError && (
                  <div className="p-2 mb-4 bg-red-50 text-red-600 rounded-md text-sm">
                    {formError}
                  </div>
                )}
                <Input
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter nugget title"
                  variant="bordered"
                  isRequired
                />
                <Textarea
                  label="Principle"
                  name="principle"
                  value={formData.principle}
                  onChange={handleInputChange}
                  placeholder="Enter the legal principle"
                  minRows={4}
                  variant="bordered"
                  isRequired
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="YYYY"
                    variant="bordered"
                    type="number"
                  />
                  <Input
                    label="Citation Number"
                    name="citation_no"
                    value={formData.citation_no}
                    onChange={handleInputChange}
                    placeholder="Optional citation number"
                    variant="bordered"
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onEditClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={updatePersonalNugget}
                  isLoading={isSubmitting}
                  isDisabled={!formData.title || !formData.principle}
                >
                  Update Nugget
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={onDeleteConfirmClose}
        size="sm"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Confirm Delete
              </ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to delete this nugget? This action
                  cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="default"
                  variant="light"
                  onPress={onDeleteConfirmClose}
                >
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={deletePersonalNugget}
                  isLoading={isDeleting}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Use the NuggetDrawer component */}
      <NuggetDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        nugget={selectedNugget}
        parentType="area"
        onBookmarkChange={handleBookmarkChange}
        baseUrl={baseUrl}
      />
    </AdminLayout>
  );
}
