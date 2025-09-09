import Container from "@/app/components/container";
import Card from "@/app/components/ui/card";
import Skeleton from "@/app/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <main>
      <Container className="py-6 sm:py-8 space-y-6 px-4 sm:px-0">
        {/* Header skeleton */}
        <div className="fade-in-up">
          <Skeleton height="2rem" width="150px" className="mb-2" />
          <Skeleton height="1.125rem" width="250px" />
        </div>

        {/* Subscription status skeleton */}
        <Card className="fade-in">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton height="1.5rem" width="180px" className="mb-4" />
              <div className="flex items-center gap-2 mb-2">
                <Skeleton width="12px" height="12px" rounded="full" />
                <Skeleton height="1rem" width="120px" />
              </div>
              <Skeleton height="0.875rem" width="350px" />
            </div>
            <div className="flex gap-2">
              <Skeleton height="2.5rem" width="120px" />
              <Skeleton height="2.5rem" width="100px" />
            </div>
          </div>
        </Card>

        {/* Quick stats skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 sm:px-0">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="fade-in">
              <Skeleton height="1.25rem" width="100px" className="mb-2" />
              <Skeleton height="2rem" width="60px" className="mb-1" />
              <Skeleton height="0.875rem" width="140px" />
            </Card>
          ))}
        </div>

        {/* Quick actions skeleton */}
        <Card className="fade-in">
          <Skeleton height="1.5rem" width="180px" className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height="2.5rem" className="rounded-md" />
            ))}
          </div>
        </Card>
      </Container>
    </main>
  );
}
