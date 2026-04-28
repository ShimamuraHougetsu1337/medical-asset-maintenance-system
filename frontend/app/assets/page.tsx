import { Asset } from "@/types";
import { getAssets } from "@/app/actions/assets";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ReportFailureForm } from "@/components/ReportFailureForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AssetsPage() {
  const assets = await getAssets();

  const getStatusVariant = (status: Asset['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'AVAILABLE': return 'secondary';
      case 'BROKEN': return 'destructive';
      case 'UNDER_MAINTENANCE': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Asset Inventory</h2>
          <p className="text-muted-foreground">Manage and track hospital medical equipment.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Name</TableHead>
                <TableHead>Asset Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>{asset.code}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(asset.status)}>
                      {asset.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    {asset.status === 'AVAILABLE' && (
                      <ReportFailureForm assetId={asset.id} assetName={asset.name} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
