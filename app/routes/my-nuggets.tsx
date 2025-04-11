import { useState, useEffect } from "react";
import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
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
  Tabs,
  Tab,
  Select,
  SelectItem,
} from "@nextui-org/react";
import axios from "axios";
import NuggetDrawer, { Nugget } from "~/components/NuggetDrawer";
import NuggetListCard from "~/components/NuggetListCard";

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
  baseUrl: string;
}

// Server loader - gets base URL but doesn't try to authenticate
export const loader: LoaderFunction = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_DL_LIVE_URL;
  return json({ baseUrl });
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
      baseUrl,
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

    return {
      nuggets: response.data?.data || [],
      totalPages: response.data?.meta?.last_page || 1,
      currentPage: parseInt(page),
      perPage: response.data?.meta?.per_page || 10,
      error: null,
      baseUrl,
    };
  } catch (error: any) {
    console.error("Error fetching user nuggets:", error);
    return {
      nuggets: [],
      totalPages: 0,
      currentPage: 1,
      perPage: 10,
      error: error.response?.data?.message || "Failed to fetch nuggets",
      baseUrl,
    };
  }
};

// Set hydrate to true since we need client data on initial load
clientLoader.hydrate = true;

interface NuggetFormData {
  title: string;
  principle: string;
  headnote?: string;
  quote?: string;
  dl_citation_no?: string;
  year?: string;
  citation_no?: string;
  judge_title?: string;
  page_number?: string;
  courts?: string;
  other_citations?: string;
  status?: string;
  slug?: string;
  judges?: string;
  personal_areas_of_law?: string;
}

export const meta: MetaFunction = () => {
  return [
    { title: "My Nuggets | Dennislaw" },
    { name: "description", content: "Manage your personal legal nuggets" },
    { name: "og:title", content: "My Nuggets | Dennislaw" },
    {
      name: "og:description",
      content:
        "Create, edit, and manage your personal collection of legal nuggets",
    },
  ];
};

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
    headnote: "",
    quote: "",
    dl_citation_no: "",
    year: "",
    citation_no: "",
    judge_title: "",
    page_number: "",
    courts: "",
    other_citations: "",
    status: "",
    slug: "",
    judges: "",
    personal_areas_of_law: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [nuggetToDelete, setNuggetToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // Define judges for the dropdown
  const [judges, setJudges] = useState<{ id: number; fullname: string }[]>([]);
  const [loadingJudges, setLoadingJudges] = useState(false);

  // Fetch judges on component mount
  useEffect(() => {
    fetchJudges();
  }, []);

  // Function to fetch judges
  const fetchJudges = async () => {
    setLoadingJudges(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await axios.get(`${baseUrl}/judges`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        setJudges(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching judges:", error);
    } finally {
      setLoadingJudges(false);
    }
  };

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
      headnote: nugget.headnote || "",
      quote: nugget.quote || "",
      dl_citation_no: nugget.dl_citation_no || "",
      year: nugget.year ? String(nugget.year) : "",
      citation_no: nugget.citation_no || "",
      judge_title: nugget.judge_title || "",
      page_number: nugget.page_number ? String(nugget.page_number) : "",
      courts: nugget.courts || "",
      other_citations: nugget.other_citations || "",
      status: nugget.status || "",
      slug: nugget.slug || "",
      judges: nugget.judge?.id.toString(),
      personal_areas_of_law: "",
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
        headnote: "",
        quote: "",
        dl_citation_no: "",
        year: "",
        citation_no: "",
        judge_title: "",
        page_number: "",
        courts: "",
        other_citations: "",
        status: "",
        slug: "",
        judges: "",
        personal_areas_of_law: "",
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
        headnote: "",
        quote: "",
        dl_citation_no: "",
        year: "",
        citation_no: "",
        judge_title: "",
        page_number: "",
        courts: "",
        other_citations: "",
        status: "",
        slug: "",
        judges: "",
        personal_areas_of_law: "",
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
      <div className="p-4 sm:p-6 bg-white rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold">My Nuggets</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              color="primary"
              startContent={<MdAdd />}
              onClick={onOpen}
              size="sm"
              className="w-full sm:w-auto"
            >
              Add Nugget
            </Button>
            {nuggets?.length > 0 && (
              <Button
                color="danger"
                variant="light"
                onClick={deleteAllPersonalNuggets}
                size="sm"
                className="w-full sm:w-auto"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nuggets?.map((nugget) => (
                <NuggetListCard
                  key={`${nugget.id}-${refreshKey}`}
                  nugget={nugget}
                  onView={openDrawer}
                  onEdit={openEditModal}
                  onDelete={(id) => {
                    setNuggetToDelete(id);
                    onDeleteConfirmOpen();
                  }}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-8 overflow-x-auto">
                <Pagination
                  total={totalPages}
                  initialPage={currentPage}
                  onChange={(page) => navigate(`/my-nuggets?page=${page}`)}
                  classNames={{
                    wrapper: "overflow-x-auto px-2 py-1",
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Nugget Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        scrollBehavior="inside"
      >
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
                <Tabs aria-label="Nugget form sections" className="w-full">
                  <Tab key="basic" title="Basic Information">
                    <div className="mt-4 space-y-4">
                      <Input
                        label="Title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter nugget title"
                        variant="bordered"
                        isRequired
                        fullWidth
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
                        fullWidth
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Year"
                          name="year"
                          value={formData.year}
                          onChange={handleInputChange}
                          placeholder="YYYY"
                          variant="bordered"
                          type="number"
                          fullWidth
                        />
                        <Input
                          label="Citation Number"
                          name="citation_no"
                          value={formData.citation_no}
                          onChange={handleInputChange}
                          placeholder="Citation number"
                          variant="bordered"
                          fullWidth
                        />
                      </div>
                    </div>
                  </Tab>
                  <Tab key="details" title="Additional Details">
                    <div className="mt-4 space-y-4">
                      <Textarea
                        label="Headnote"
                        name="headnote"
                        value={formData.headnote}
                        onChange={handleInputChange}
                        placeholder="Enter the headnote"
                        minRows={3}
                        variant="bordered"
                        fullWidth
                      />
                      <Textarea
                        label="Quote"
                        name="quote"
                        value={formData.quote}
                        onChange={handleInputChange}
                        placeholder="Enter the quote"
                        minRows={3}
                        variant="bordered"
                        fullWidth
                      />
                      <Input
                        label="DL Citation No"
                        name="dl_citation_no"
                        value={formData.dl_citation_no}
                        onChange={handleInputChange}
                        placeholder="DL citation number"
                        variant="bordered"
                        fullWidth
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Status"
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          placeholder="Status (e.g., Published)"
                          variant="bordered"
                          fullWidth
                        />
                        <Input
                          label="Slug"
                          name="slug"
                          value={formData.slug}
                          onChange={handleInputChange}
                          placeholder="URL slug"
                          variant="bordered"
                          fullWidth
                        />
                      </div>
                    </div>
                  </Tab>
                  <Tab key="source" title="Source Information">
                    <div className="mt-4 space-y-4">
                      <Select
                        label="Judge"
                        placeholder="Select a judge"
                        variant="bordered"
                        selectedKeys={formData.judges ? [formData.judges] : []}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            judges: value || undefined,
                          }));
                        }}
                        fullWidth
                      >
                        {[
                          <SelectItem key="" value="">
                            No Judge
                          </SelectItem>,
                          ...judges.map((judge) => (
                            <SelectItem
                              key={judge.id.toString()}
                              value={judge.id.toString()}
                            >
                              {judge.fullname}
                            </SelectItem>
                          )),
                        ]}
                      </Select>
                      <Input
                        label="Judge Title"
                        name="judge_title"
                        value={formData.judge_title}
                        onChange={handleInputChange}
                        placeholder="Judge title"
                        variant="bordered"
                        fullWidth
                      />
                      <Input
                        label="Page Number"
                        name="page_number"
                        value={formData.page_number}
                        onChange={handleInputChange}
                        placeholder="Page number"
                        variant="bordered"
                        type="number"
                        fullWidth
                      />
                      <Textarea
                        label="Courts"
                        name="courts"
                        value={formData.courts}
                        onChange={handleInputChange}
                        placeholder="Courts information"
                        minRows={2}
                        variant="bordered"
                        fullWidth
                      />
                      <Textarea
                        label="Other Citations"
                        name="other_citations"
                        value={formData.other_citations}
                        onChange={handleInputChange}
                        placeholder="Other citations"
                        minRows={2}
                        variant="bordered"
                        fullWidth
                      />
                      <Textarea
                        label="Areas of Law"
                        name="personal_areas_of_law"
                        value={formData.personal_areas_of_law}
                        onChange={handleInputChange}
                        placeholder="Areas of law (comma separated)"
                        minRows={2}
                        variant="bordered"
                        fullWidth
                      />
                    </div>
                  </Tab>
                </Tabs>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={addPersonalNugget}
                  isLoading={isSubmitting}
                  isDisabled={!formData.title || !formData.principle}
                  className="w-full sm:w-auto"
                >
                  Save Nugget
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Nugget Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={onEditClose}
        size="lg"
        scrollBehavior="inside"
      >
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
                <Tabs aria-label="Nugget form sections" className="w-full">
                  <Tab key="basic" title="Basic Information">
                    <div className="mt-4 space-y-4">
                      <Input
                        label="Title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter nugget title"
                        variant="bordered"
                        isRequired
                        fullWidth
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
                        fullWidth
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Year"
                          name="year"
                          value={formData.year}
                          onChange={handleInputChange}
                          placeholder="YYYY"
                          variant="bordered"
                          type="number"
                          fullWidth
                        />
                        <Input
                          label="Citation Number"
                          name="citation_no"
                          value={formData.citation_no}
                          onChange={handleInputChange}
                          placeholder="Citation number"
                          variant="bordered"
                          fullWidth
                        />
                      </div>
                    </div>
                  </Tab>
                  <Tab key="details" title="Additional Details">
                    <div className="mt-4 space-y-4">
                      <Textarea
                        label="Headnote"
                        name="headnote"
                        value={formData.headnote}
                        onChange={handleInputChange}
                        placeholder="Enter the headnote"
                        minRows={3}
                        variant="bordered"
                        fullWidth
                      />
                      <Textarea
                        label="Quote"
                        name="quote"
                        value={formData.quote}
                        onChange={handleInputChange}
                        placeholder="Enter the quote"
                        minRows={3}
                        variant="bordered"
                        fullWidth
                      />
                      <Input
                        label="DL Citation No"
                        name="dl_citation_no"
                        value={formData.dl_citation_no}
                        onChange={handleInputChange}
                        placeholder="DL citation number"
                        variant="bordered"
                        fullWidth
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Status"
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          placeholder="Status (e.g., Published)"
                          variant="bordered"
                          fullWidth
                        />
                        <Input
                          label="Slug"
                          name="slug"
                          value={formData.slug}
                          onChange={handleInputChange}
                          placeholder="URL slug"
                          variant="bordered"
                          fullWidth
                        />
                      </div>
                    </div>
                  </Tab>
                  <Tab key="source" title="Source Information">
                    <div className="mt-4 space-y-4">
                      <Select
                        label="Judge"
                        placeholder="Select a judge"
                        variant="bordered"
                        selectedKeys={formData.judges ? [formData.judges] : []}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            judges: value || undefined,
                          }));
                        }}
                        fullWidth
                      >
                        {[
                          <SelectItem key="" value="">
                            No Judge
                          </SelectItem>,
                          ...judges.map((judge) => (
                            <SelectItem
                              key={judge.id.toString()}
                              value={judge.id.toString()}
                            >
                              {judge.fullname}
                            </SelectItem>
                          )),
                        ]}
                      </Select>
                      <Input
                        label="Judge Title"
                        name="judge_title"
                        value={formData.judge_title}
                        onChange={handleInputChange}
                        placeholder="Judge title"
                        variant="bordered"
                        fullWidth
                      />
                      <Input
                        label="Page Number"
                        name="page_number"
                        value={formData.page_number}
                        onChange={handleInputChange}
                        placeholder="Page number"
                        variant="bordered"
                        type="number"
                        fullWidth
                      />
                      <Textarea
                        label="Courts"
                        name="courts"
                        value={formData.courts}
                        onChange={handleInputChange}
                        placeholder="Courts information"
                        minRows={2}
                        variant="bordered"
                        fullWidth
                      />
                      <Textarea
                        label="Other Citations"
                        name="other_citations"
                        value={formData.other_citations}
                        onChange={handleInputChange}
                        placeholder="Other citations"
                        minRows={2}
                        variant="bordered"
                        fullWidth
                      />
                      <Textarea
                        label="Areas of Law"
                        name="personal_areas_of_law"
                        value={formData.personal_areas_of_law}
                        onChange={handleInputChange}
                        placeholder="Areas of law (comma separated)"
                        minRows={2}
                        variant="bordered"
                        fullWidth
                      />
                    </div>
                  </Tab>
                </Tabs>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onEditClose}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={updatePersonalNugget}
                  isLoading={isSubmitting}
                  isDisabled={!formData.title || !formData.principle}
                  className="w-full sm:w-auto"
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
              <ModalFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  color="default"
                  variant="light"
                  onPress={onDeleteConfirmClose}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={deletePersonalNugget}
                  isLoading={isDeleting}
                  className="w-full sm:w-auto order-1 sm:order-2"
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
