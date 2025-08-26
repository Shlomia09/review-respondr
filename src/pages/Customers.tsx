import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserCheck, Star, DollarSign, Search, Phone, Mail, Calendar, Tag } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalReviews: number;
  averageRating: number;
  lastReview: string;
  status: "active" | "inactive";
  tags: string[];
  totalSpent: number;
}

interface CustomersTableProps {
  customers: Customer[];
}

export function Customers() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Mock customer data - in real app, fetch from Supabase
  const mockCustomers: Customer[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "+1-555-0123",
      totalReviews: 5,
      averageRating: 4.8,
      lastReview: "2024-01-15",
      status: "active",
      tags: ["VIP", "Frequent"],
      totalSpent: 2500
    },
    {
      id: "2", 
      name: "Mike Chen",
      email: "mike.chen@email.com",
      phone: "+1-555-0456",
      totalReviews: 3,
      averageRating: 4.3,
      lastReview: "2024-01-10",
      status: "active",
      tags: ["Regular"],
      totalSpent: 850
    },
    {
      id: "3",
      name: "Emily Davis",
      email: "emily.d@email.com", 
      phone: "+1-555-0789",
      totalReviews: 2,
      averageRating: 5.0,
      lastReview: "2024-01-08",
      status: "inactive",
      tags: ["New"],
      totalSpent: 320
    },
    {
      id: "4",
      name: "David Wilson",
      email: "d.wilson@email.com",
      phone: "+1-555-0321",
      totalReviews: 8,
      averageRating: 4.6,
      lastReview: "2024-01-12",
      status: "active",
      tags: ["VIP", "Loyal"],
      totalSpent: 4200
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCustomers(mockCustomers);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || customer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === "active").length,
    avgRating: customers.reduce((acc, c) => acc + c.averageRating, 0) / customers.length || 0,
    totalRevenue: customers.reduce((acc, c) => acc + c.totalSpent, 0)
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">{t("sidebar.customers")}</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{t("sidebar.customers")}</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("customers.totalCustomers")}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("customers.activeCustomers")}</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("customers.avgRating")}</p>
                <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("customers.totalRevenue")}</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>{t("customers.customerList")}</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t("customers.searchCustomers")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("customers.allCustomers")}</SelectItem>
                  <SelectItem value="active">{t("customers.activeOnly")}</SelectItem>
                  <SelectItem value="inactive">{t("customers.inactiveOnly")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CustomersTable customers={filteredCustomers} />
        </CardContent>
      </Card>
    </div>
  );
}

function CustomersTable({ customers }: CustomersTableProps) {
  const { t } = useTranslation();

  const getStatusBadge = (status: Customer["status"]) => {
    return (
      <Badge variant={status === "active" ? "default" : "secondary"}>
        {status === "active" ? t("customers.active") : t("customers.inactive")}
      </Badge>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("customers.name")}</TableHead>
            <TableHead>{t("customers.contact")}</TableHead>
            <TableHead>{t("customers.reviews")}</TableHead>
            <TableHead>{t("customers.rating")}</TableHead>
            <TableHead>{t("customers.lastReview")}</TableHead>
            <TableHead>{t("customers.spent")}</TableHead>
            <TableHead>{t("customers.status")}</TableHead>
            <TableHead>{t("customers.tags")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="text-muted-foreground">
                  {t("customers.noCustomersFound")}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {customer.name.charAt(0)}
                      </span>
                    </div>
                    <span>{customer.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span>{customer.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>{customer.phone}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{customer.totalReviews}</span>
                </TableCell>
                <TableCell>
                  {renderStars(customer.averageRating)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>
                      {new Date(customer.lastReview).toLocaleDateString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    ${customer.totalSpent.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  {getStatusBadge(customer.status)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {customer.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Tag className="h-2 w-2 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}