import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter } from '../Table';

describe('Table', () => {
  it('should render table with headers and rows', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Age</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John</TableCell>
            <TableCell>30</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Jane</TableCell>
            <TableCell>25</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
  });

  it('should render table headers in thead', () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header 1</TableHead>
            <TableHead>Header 2</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );

    const thead = container.querySelector('thead');
    expect(thead).toBeInTheDocument();
    expect(thead?.querySelector('th')).toHaveTextContent('Header 1');
  });

  it('should render table data in tbody', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Data 1</TableCell>
            <TableCell>Data 2</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const tbody = container.querySelector('tbody');
    expect(tbody).toBeInTheDocument();
    expect(tbody?.querySelector('td')).toHaveTextContent('Data 1');
  });

  it('should render table footer', () => {
    const { container } = render(
      <Table>
        <TableFooter>
          <TableRow>
            <TableCell>Footer 1</TableCell>
            <TableCell>Footer 2</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );

    const tfoot = container.querySelector('tfoot');
    expect(tfoot).toBeInTheDocument();
    expect(tfoot).toHaveTextContent('Footer 1');
  });

  it('should support bordered variant', () => {
    const { container } = render(
      <Table variant="bordered">
        <TableBody>
          <TableRow>
            <TableCell>Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const table = container.querySelector('table');
    expect(table).toHaveClass('border');
  });

  it('should support striped variant', () => {
    const { container } = render(
      <Table variant="striped">
        <TableBody>
          <TableRow>
            <TableCell>Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const table = container.querySelector('table');
    expect(table).toHaveClass('divide-y');
  });

  it('should support different sizes', () => {
    const { container } = render(
      <Table size="lg">
        <TableBody>
          <TableRow>
            <TableCell>Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const table = container.querySelector('table');
    expect(table).toHaveClass('text-base');
  });

  it('should support hover variant on rows', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow variant="hover">
            <TableCell>Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const row = container.querySelector('tr');
    expect(row).toHaveClass('hover:bg-muted/50');
  });

  it('should render complex table structure', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>1</TableCell>
            <TableCell>John Doe</TableCell>
            <TableCell>john@example.com</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>2</TableCell>
            <TableCell>Jane Smith</TableCell>
            <TableCell>jane@example.com</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell>2 users</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('should be scrollable', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const wrapper = container.querySelector('.overflow-auto');
    expect(wrapper).toBeInTheDocument();
  });
});
