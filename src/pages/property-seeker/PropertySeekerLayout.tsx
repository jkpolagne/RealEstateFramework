import { Outlet } from 'react-router-dom';
import { TopNav } from '../../components/property-seeker/TopNav';

export function PropertySeekerLayout() {
  return (
    <div className="property-seeker-layout">
      <TopNav />
      <main className="property-seeker-main">
        <Outlet />
      </main>
    </div>
  );
}
